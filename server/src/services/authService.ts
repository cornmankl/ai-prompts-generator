import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { cacheService } from './cacheService';
import { logger } from './loggerService';
import { sendEmail } from './emailService';
import { sendSMS } from './smsService';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginAttempt {
    ip: string;
    userAgent: string;
    timestamp: Date;
    success: boolean;
}

export class AuthService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    private readonly ACCESS_TOKEN_EXPIRY = '15m';
    private readonly REFRESH_TOKEN_EXPIRY = '7d';
    private readonly MAX_LOGIN_ATTEMPTS = 5;
    private readonly LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        username: string;
    }): Promise<{ user: any; tokens: AuthTokens }> {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email: userData.email }, { username: userData.username }]
            });

            if (existingUser) {
                throw new Error('User already exists with this email or username');
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create user
            const user = new User({
                ...userData,
                password: hashedPassword,
                emailVerified: false,
                twoFactorEnabled: false,
                loginAttempts: 0,
                lockedUntil: null,
                lastLogin: null,
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    }
                }
            });

            await user.save();

            // Generate tokens
            const tokens = await this.generateTokens(user._id.toString());

            // Cache user data
            await cacheService.set(
                cacheService.generateUserCacheKey(user._id.toString()),
                JSON.stringify(user.toObject()),
                3600 // 1 hour
            );

            // Send verification email
            await this.sendVerificationEmail(user);

            logger.info(`New user registered: ${user.email}`);

            return {
                user: this.sanitizeUser(user),
                tokens
            };
        } catch (error) {
            logger.error('Registration error:', error);
            throw error;
        }
    }

    async login(email: string, password: string, ip: string, userAgent: string): Promise<{ user: any; tokens: AuthTokens; requires2FA: boolean }> {
        try {
            // Check for too many login attempts
            const attemptKey = `login_attempts:${ip}`;
            const attempts = await cacheService.get(attemptKey);
            const attemptCount = attempts ? parseInt(attempts) : 0;

            if (attemptCount >= this.MAX_LOGIN_ATTEMPTS) {
                throw new Error('Too many login attempts. Please try again later.');
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                await this.recordFailedAttempt(ip, userAgent);
                throw new Error('Invalid credentials');
            }

            // Check if account is locked
            if (user.lockedUntil && user.lockedUntil > new Date()) {
                throw new Error('Account is temporarily locked due to too many failed attempts');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                await this.recordFailedAttempt(ip, userAgent);
                await this.handleFailedLogin(user);
                throw new Error('Invalid credentials');
            }

            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lockedUntil = null;
            user.lastLogin = new Date();
            await user.save();

            // Clear failed attempts
            await cacheService.del(attemptKey);

            // Record successful login
            await this.recordSuccessfulLogin(user, ip, userAgent);

            // Check if 2FA is enabled
            if (user.twoFactorEnabled) {
                return {
                    user: this.sanitizeUser(user),
                    tokens: {} as AuthTokens,
                    requires2FA: true
                };
            }

            // Generate tokens
            const tokens = await this.generateTokens(user._id.toString());

            // Cache user data
            await cacheService.set(
                cacheService.generateUserCacheKey(user._id.toString()),
                JSON.stringify(user.toObject()),
                3600
            );

            logger.info(`User logged in: ${user.email}`);

            return {
                user: this.sanitizeUser(user),
                tokens,
                requires2FA: false
            };
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    async verify2FA(userId: string, token: string): Promise<AuthTokens> {
        try {
            const user = await User.findById(userId);
            if (!user || !user.twoFactorEnabled) {
                throw new Error('2FA not enabled for this user');
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret!,
                encoding: 'base32',
                token,
                window: 2 // Allow 2 time steps (60 seconds) of tolerance
            });

            if (!verified) {
                throw new Error('Invalid 2FA token');
            }

            // Generate tokens
            const tokens = await this.generateTokens(user._id.toString());

            // Cache user data
            await cacheService.set(
                cacheService.generateUserCacheKey(user._id.toString()),
                JSON.stringify(user.toObject()),
                3600
            );

            logger.info(`2FA verified for user: ${user.email}`);

            return tokens;
        } catch (error) {
            logger.error('2FA verification error:', error);
            throw error;
        }
    }

    async setup2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const secret = speakeasy.generateSecret({
                name: `AI Prompts Generator (${user.email})`,
                issuer: 'AI Prompts Generator',
                length: 32
            });

            user.twoFactorSecret = secret.base32;
            await user.save();

            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

            return {
                secret: secret.base32,
                qrCodeUrl
            };
        } catch (error) {
            logger.error('2FA setup error:', error);
            throw error;
        }
    }

    async enable2FA(userId: string, token: string): Promise<boolean> {
        try {
            const user = await User.findById(userId);
            if (!user || !user.twoFactorSecret) {
                throw new Error('2FA not set up for this user');
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token,
                window: 2
            });

            if (!verified) {
                throw new Error('Invalid 2FA token');
            }

            user.twoFactorEnabled = true;
            await user.save();

            logger.info(`2FA enabled for user: ${user.email}`);

            return true;
        } catch (error) {
            logger.error('2FA enable error:', error);
            throw error;
        }
    }

    async disable2FA(userId: string, password: string): Promise<boolean> {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            user.twoFactorEnabled = false;
            user.twoFactorSecret = undefined;
            await user.save();

            logger.info(`2FA disabled for user: ${user.email}`);

            return true;
        } catch (error) {
            logger.error('2FA disable error:', error);
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;

            // Check if refresh token exists in cache
            const cachedToken = await cacheService.get(`refresh_token:${decoded.userId}`);
            if (!cachedToken || cachedToken !== refreshToken) {
                throw new Error('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(decoded.userId);

            // Update refresh token in cache
            await cacheService.set(
                `refresh_token:${decoded.userId}`,
                tokens.refreshToken,
                7 * 24 * 60 * 60 // 7 days
            );

            return tokens;
        } catch (error) {
            logger.error('Token refresh error:', error);
            throw new Error('Invalid refresh token');
        }
    }

    async logout(userId: string, refreshToken?: string): Promise<void> {
        try {
            // Remove user from cache
            await cacheService.del(cacheService.generateUserCacheKey(userId));

            // Remove refresh token from cache
            if (refreshToken) {
                await cacheService.del(`refresh_token:${userId}`);
            }

            logger.info(`User logged out: ${userId}`);
        } catch (error) {
            logger.error('Logout error:', error);
            throw error;
        }
    }

    async verifyEmail(token: string): Promise<boolean> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as any;
            const user = await User.findById(decoded.userId);

            if (!user) {
                throw new Error('User not found');
            }

            user.emailVerified = true;
            user.emailVerificationToken = undefined;
            await user.save();

            logger.info(`Email verified for user: ${user.email}`);

            return true;
        } catch (error) {
            logger.error('Email verification error:', error);
            throw error;
        }
    }

    async resendVerificationEmail(email: string): Promise<void> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            if (user.emailVerified) {
                throw new Error('Email already verified');
            }

            await this.sendVerificationEmail(user);
        } catch (error) {
            logger.error('Resend verification email error:', error);
            throw error;
        }
    }

    async forgotPassword(email: string): Promise<void> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                // Don't reveal if user exists
                return;
            }

            const resetToken = jwt.sign(
                { userId: user._id, type: 'password_reset' },
                this.JWT_SECRET,
                { expiresIn: '1h' }
            );

            user.passwordResetToken = resetToken;
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();

            // Send reset email
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                template: 'password-reset',
                data: {
                    name: user.firstName,
                    resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
                }
            });

            logger.info(`Password reset requested for user: ${user.email}`);
        } catch (error) {
            logger.error('Forgot password error:', error);
            throw error;
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as any;

            if (decoded.type !== 'password_reset') {
                throw new Error('Invalid token type');
            }

            const user = await User.findOne({
                _id: decoded.userId,
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() }
            });

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            user.password = hashedPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.loginAttempts = 0;
            user.lockedUntil = null;
            await user.save();

            logger.info(`Password reset for user: ${user.email}`);

            return true;
        } catch (error) {
            logger.error('Password reset error:', error);
            throw error;
        }
    }

    private async generateTokens(userId: string): Promise<AuthTokens> {
        const accessToken = jwt.sign(
            { userId, type: 'access' },
            this.JWT_SECRET,
            { expiresIn: this.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { userId, type: 'refresh' },
            this.JWT_REFRESH_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRY }
        );

        // Cache refresh token
        await cacheService.set(
            `refresh_token:${userId}`,
            refreshToken,
            7 * 24 * 60 * 60 // 7 days
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 * 1000 // 15 minutes in milliseconds
        };
    }

    private async recordFailedAttempt(ip: string, userAgent: string): Promise<void> {
        const attemptKey = `login_attempts:${ip}`;
        const currentAttempts = await cacheService.get(attemptKey);
        const attempts = currentAttempts ? parseInt(currentAttempts) + 1 : 1;

        await cacheService.set(attemptKey, attempts.toString(), this.LOCKOUT_TIME);

        logger.warn(`Failed login attempt from IP: ${ip}`);
    }

    private async recordSuccessfulLogin(user: any, ip: string, userAgent: string): Promise<void> {
        const loginAttempt: LoginAttempt = {
            ip,
            userAgent,
            timestamp: new Date(),
            success: true
        };

        // Store in cache for analytics
        await cacheService.set(
            `login_attempt:${user._id}:${Date.now()}`,
            JSON.stringify(loginAttempt),
            24 * 60 * 60 // 24 hours
        );
    }

    private async handleFailedLogin(user: any): Promise<void> {
        user.loginAttempts += 1;

        if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + this.LOCKOUT_TIME);
        }

        await user.save();
    }

    private async sendVerificationEmail(user: any): Promise<void> {
        const verificationToken = jwt.sign(
            { userId: user._id, type: 'email_verification' },
            this.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.emailVerificationToken = verificationToken;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            template: 'email-verification',
            data: {
                name: user.firstName,
                verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
            }
        });
    }

    private sanitizeUser(user: any): any {
        const sanitized = user.toObject();
        delete sanitized.password;
        delete sanitized.twoFactorSecret;
        delete sanitized.passwordResetToken;
        delete sanitized.passwordResetExpires;
        delete sanitized.emailVerificationToken;
        return sanitized;
    }
}

export const authService = new AuthService();
