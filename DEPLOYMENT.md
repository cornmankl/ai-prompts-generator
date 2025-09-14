# 🚀 Production Deployment Guide

This guide covers the complete deployment process for the AI Prompts Generator application in a production environment.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **CPU**: Minimum 4 cores, Recommended 8+ cores
- **Storage**: Minimum 100GB SSD
- **Network**: Stable internet connection

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Node.js 18+ (for development)
- Nginx (included in Docker setup)

## 🔧 Installation Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login to apply Docker group changes
```

### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/ai-prompts-generator.git
cd ai-prompts-generator

# Switch to production branch
git checkout main
```

### 3. Environment Configuration

```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/ai-prompts-prod
REDIS_URL=redis://redis:6379

# JWT Secrets (Generate strong secrets)
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key

# Domain Configuration
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. SSL Certificate Setup

```bash
# Create SSL directory
sudo mkdir -p /opt/ai-prompts/ssl

# Generate self-signed certificate (for testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/ai-prompts/ssl/key.pem \
  -out /opt/ai-prompts/ssl/cert.pem

# For production, use Let's Encrypt
sudo apt install certbot -y
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/ai-prompts/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/ai-prompts/ssl/key.pem
```

### 5. Deploy Application

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### 6. Verify Deployment

```bash
# Check service status
docker-compose ps

# Check application health
curl http://localhost/health

# Check logs
docker-compose logs -f app
```

## 🔍 Monitoring Setup

### 1. Access Monitoring Dashboards

- **Application**: https://your-domain.com
- **Grafana**: https://your-domain.com:3001 (admin/admin)
- **Prometheus**: https://your-domain.com:9090
- **Kibana**: https://your-domain.com:5601

### 2. Set Up Alerts

```bash
# Configure email alerts
echo "admin@your-domain.com" > /opt/ai-prompts/alerts/email.txt

# Configure Slack webhooks
echo "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK" > /opt/ai-prompts/alerts/slack.txt
```

## 🛠️ Maintenance

### Daily Tasks

```bash
# Check service status
docker-compose ps

# Check disk usage
df -h

# Check memory usage
free -h

# Check logs for errors
docker-compose logs --tail=100 app | grep ERROR
```

### Weekly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker images
docker system prune -f

# Backup database
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)
```

### Monthly Tasks

```bash
# Update application
cd /opt/ai-prompts
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Review logs
docker-compose logs --since=30d | grep -i error

# Check security updates
npm audit
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure Fail2Ban
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSL/TLS Configuration

```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check SSL rating
curl -s "https://api.ssllabs.com/api/v3/analyze?host=your-domain.com" | jq
```

## 📊 Performance Optimization

### 1. Database Optimization

```bash
# Connect to MongoDB
docker-compose exec mongodb mongo

# Create indexes
use ai-prompts-prod
db.users.createIndex({email: 1}, {unique: true})
db.conversations.createIndex({userId: 1, createdAt: -1})
db.audit_logs.createIndex({timestamp: -1})
```

### 2. Redis Optimization

```bash
# Configure Redis
docker-compose exec redis redis-cli CONFIG SET maxmemory 2gb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Nginx Optimization

```bash
# Edit Nginx configuration
nano nginx.conf

# Test configuration
docker-compose exec nginx nginx -t

# Reload configuration
docker-compose exec nginx nginx -s reload
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "(MONGODB|REDIS|JWT)"

# Restart services
docker-compose restart
```

#### 2. Database Connection Issues

```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check Redis status
docker-compose exec redis redis-cli ping
```

#### 3. High Memory Usage

```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart

# Check for memory leaks
docker-compose logs app | grep -i memory
```

#### 4. SSL Certificate Issues

```bash
# Check certificate
openssl x509 -in /opt/ai-prompts/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/ai-prompts/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/ai-prompts/ssl/key.pem
docker-compose restart nginx
```

### Log Analysis

```bash
# Application logs
docker-compose logs -f app

# Nginx logs
docker-compose logs -f nginx

# Database logs
docker-compose logs -f mongodb

# All services
docker-compose logs -f
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3

# Use load balancer
# Configure Nginx upstream with multiple app instances
```

### Vertical Scaling

```bash
# Increase memory limits in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

## 🔄 Backup and Recovery

### Backup Script

```bash
#!/bin/bash
# Create backup script
cat > /opt/ai-prompts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/ai-prompts/$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T mongodb mongodump --out /backup
docker cp $(docker-compose ps -q mongodb):/backup $BACKUP_DIR/

# Backup application data
cp -r /opt/ai-prompts/uploads $BACKUP_DIR/
cp /opt/ai-prompts/.env $BACKUP_DIR/

# Compress backup
tar -czf $BACKUP_DIR.tar.gz -C /opt/backups/ai-prompts $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

# Upload to S3 (if configured)
# aws s3 cp $BACKUP_DIR.tar.gz s3://your-backup-bucket/
EOF

chmod +x /opt/ai-prompts/backup.sh
```

### Recovery Process

```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d mongodb
sleep 30
docker-compose exec -T mongodb mongorestore /backup

# Restore application data
cp -r /path/to/backup/uploads /opt/ai-prompts/
cp /path/to/backup/.env /opt/ai-prompts/

# Start services
docker-compose up -d
```

## 📞 Support

For additional support:

1. **Documentation**: Check the `/docs` directory
2. **Issues**: Create GitHub issues for bugs
3. **Discussions**: Use GitHub discussions for questions
4. **Email**: Contact admin@your-domain.com

## 🔄 Updates

### Updating the Application

```bash
# Pull latest changes
cd /opt/ai-prompts
git pull origin main

# Run deployment script
./scripts/deploy.sh

# Verify update
curl http://localhost/health
```

### Rolling Back

```bash
# Stop current services
docker-compose down

# Restore from backup
cd /opt/backups/ai-prompts
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
cp -r backup-YYYYMMDD-HHMMSS/* /opt/ai-prompts/

# Start services
docker-compose up -d
```

---

**Note**: This deployment guide assumes a single-server setup. For production environments with high availability requirements, consider implementing load balancers, database clustering, and container orchestration platforms like Kubernetes.
