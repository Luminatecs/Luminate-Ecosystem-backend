#!/bin/bash

# Simple SSL Setup Script for IP-based HTTPS
# This script sets up Nginx with self-signed SSL certificates

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_PORT="3002"              # Your Node.js app port
APP_NAME="luminate-backend"  # PM2 app name
SSL_DIR="/etc/ssl/luminate"  # Directory for SSL certificates

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to install required packages
install_packages() {
    print_status "Updating system packages..."
    apt update

    print_status "Installing Nginx and OpenSSL..."
    apt install -y nginx openssl ufw
    
    print_success "Packages installed successfully"
}

# Function to configure firewall
setup_firewall() {
    print_status "Configuring UFW firewall..."
    
    # Enable UFW if not already enabled
    ufw --force enable
    
    # Allow SSH, HTTP, HTTPS, and app port
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow $APP_PORT/tcp
    
    print_success "Firewall configured"
}

# Function to create self-signed SSL certificate
create_ssl_certificate() {
    print_status "Creating self-signed SSL certificate..."
    
    # Create SSL directory
    mkdir -p $SSL_DIR
    
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me)
    
    # Create certificate configuration
    cat > $SSL_DIR/cert.conf << EOF
[req]
default_bits = 2048
prompt = no
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=State
L=City
O=LuminateEcosystem
OU=IT Department
CN=$SERVER_IP

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = $SERVER_IP
IP.2 = 127.0.0.1
DNS.1 = localhost
EOF

    # Generate private key and certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $SSL_DIR/private.key \
        -out $SSL_DIR/certificate.crt \
        -config $SSL_DIR/cert.conf \
        -extensions v3_req
    
    # Set proper permissions
    chmod 600 $SSL_DIR/private.key
    chmod 644 $SSL_DIR/certificate.crt
    
    print_success "SSL certificate created for IP: $SERVER_IP"
}

# Function to create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default
    
    # Get server IP
    SERVER_IP=$(curl -s ifconfig.me)
    
    # Create new site configuration
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
# HTTP server - redirects to HTTPS
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_IP localhost;

    # Redirect all traffic to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name $SERVER_IP localhost;

    # SSL Configuration
    ssl_certificate $SSL_DIR/certificate.crt;
    ssl_certificate_key $SSL_DIR/private.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    if nginx -t; then
        print_success "Nginx configuration created successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to start Nginx
start_nginx() {
    print_status "Starting Nginx..."
    
    systemctl enable nginx
    systemctl restart nginx
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx started successfully"
    else
        print_error "Failed to start Nginx"
        exit 1
    fi
}

# Function to verify setup
verify_setup() {
    print_status "Verifying SSL setup..."
    
    SERVER_IP=$(curl -s ifconfig.me)
    
    # Test HTTP redirect
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP)
    if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
        print_success "HTTP to HTTPS redirect working"
    else
        print_warning "HTTP redirect test returned: $HTTP_RESPONSE"
    fi
    
    # Test HTTPS (ignore certificate errors for self-signed)
    HTTPS_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://$SERVER_IP)
    if [ "$HTTPS_RESPONSE" = "200" ]; then
        print_success "HTTPS is working"
    else
        print_warning "HTTPS test returned: $HTTPS_RESPONSE"
    fi
}

# Function to show final information
show_completion_info() {
    SERVER_IP=$(curl -s ifconfig.me)
    
    echo
    echo "============================================="
    print_success "SSL Setup Complete!"
    echo "============================================="
    echo
    echo "📱 Your API is now available at:"
    echo "   🔒 https://$SERVER_IP"
    echo
    echo "📊 Test your endpoints:"
    echo "   Health: https://$SERVER_IP/health"
    echo "   API:    https://$SERVER_IP/api"
    echo
    echo "⚠️  IMPORTANT - Self-Signed Certificate:"
    echo "   Your browser will show a security warning"
    echo "   This is normal for self-signed certificates"
    echo "   Click 'Advanced' → 'Proceed to $SERVER_IP (unsafe)'"
    echo
    echo "� Certificate Info:"
    echo "   Type: Self-signed"
    echo "   Valid for: 365 days"
    echo "   Location: $SSL_DIR/"
    echo
    echo "🛠️  Useful commands:"
    echo "   Nginx status:      systemctl status nginx"
    echo "   Restart Nginx:     systemctl restart nginx"
    echo "   View logs:         tail -f /var/log/nginx/error.log"
    echo "   View certificate:  openssl x509 -in $SSL_DIR/certificate.crt -text -noout"
    echo
    echo "⚠️  Don't forget to:"
    echo "   1. Update your frontend API_BASE_URL to https://$SERVER_IP"
    echo "   2. Configure your client to accept self-signed certificates"
    echo "   3. Test all your API endpoints"
    echo
}

# Main execution
main() {
    echo "============================================="
    echo "🔒 Simple SSL Setup with Self-Signed Certificate"
    echo "============================================="
    echo
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
    
    install_packages
    setup_firewall
    create_ssl_certificate
    create_nginx_config
    start_nginx
    verify_setup
    show_completion_info
    
    print_success "Setup completed successfully! 🎉"
}

# Run main function
main "$@"