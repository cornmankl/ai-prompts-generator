import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'

interface EmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`)
      return fs.readFileSync(templatePath, 'utf8')
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error)
      return this.getDefaultTemplate(templateName)
    }
  }

  private getDefaultTemplate(templateName: string): string {
    const templates: Record<string, string> = {
      'email-verification': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Hello {{name}},</p>
          <p>Thank you for registering with AI Prompts Generator. Please click the button below to verify your email address:</p>
          <a href="{{verificationLink}}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>{{verificationLink}}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>AI Prompts Generator Team</p>
        </div>
      `,
      'password-reset': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hello {{name}},</p>
          <p>You requested to reset your password. Please click the button below to reset it:</p>
          <a href="{{resetLink}}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>{{resetLink}}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>AI Prompts Generator Team</p>
        </div>
      `,
      'welcome': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AI Prompts Generator!</h2>
          <p>Hello {{name}},</p>
          <p>Welcome to AI Prompts Generator! Your account has been successfully created and verified.</p>
          <p>You can now start creating amazing prompts and exploring our AI-powered features.</p>
          <a href="{{dashboardLink}}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a>
          <p>Best regards,<br>AI Prompts Generator Team</p>
        </div>
      `
    }

    return templates[templateName] || templates['welcome']
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let html = template
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, data[key])
    })
    return html
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const template = await this.loadTemplate(options.template)
      const html = this.replaceTemplateVariables(template, options.data)

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${options.to}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify your email - AI Prompts Generator',
      template: 'email-verification',
      data: {
        name,
        verificationLink: `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
      }
    })
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset your password - AI Prompts Generator',
      template: 'password-reset',
      data: {
        name,
        resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      }
    })
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to AI Prompts Generator!',
      template: 'welcome',
      data: {
        name,
        dashboardLink: `${process.env.CLIENT_URL}/dashboard`
      }
    })
  }
}

export const emailService = new EmailService()

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  return emailService.sendEmail(options)
}