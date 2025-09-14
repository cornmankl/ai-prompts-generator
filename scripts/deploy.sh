#!/bin/bash

# Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ai-prompts"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME-deploy.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed"
fi

# Create necessary directories
log "Creating necessary directories..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /var/log
sudo chown -R $USER:$USER $APP_DIR
sudo chown -R $USER:$USER $BACKUP_DIR

# Backup current deployment
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
    log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Pull latest changes
log "Pulling latest changes..."
cd $APP_DIR
git pull origin main

# Copy environment file
if [ ! -f "$APP_DIR/.env" ]; then
    log "Creating environment file..."
    cp $APP_DIR/env.production.example $APP_DIR/.env
    warning "Please update the .env file with your production configuration"
fi

# Build and start services
log "Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Run database migrations
log "Running database migrations..."
docker-compose exec -T app npm run migrate

# Health check
log "Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log "Health check passed"
        break
    else
        if [ $i -eq 10 ]; then
            error "Health check failed after 10 attempts"
        fi
        log "Health check attempt $i failed, retrying in 10 seconds..."
        sleep 10
    fi
done

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -f

# Set up log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/$APP_NAME > /dev/null <<EOF
$LOG_FILE {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Set up monitoring
log "Setting up monitoring..."
if ! crontab -l | grep -q "ai-prompts-monitor"; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * cd $APP_DIR && docker-compose ps | grep -q 'Up' || echo 'Service down' | mail -s 'AI Prompts Service Alert' admin@your-domain.com") | crontab -
fi

log "Deployment completed successfully!"
log "Application is available at: http://localhost"
log "Monitoring dashboard: http://localhost:3001"
log "Logs are available at: $LOG_FILE"

# Display service status
log "Service status:"
docker-compose ps
