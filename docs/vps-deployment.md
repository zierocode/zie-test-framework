# VPS Deployment Guide — ZTF Server

**Quick Release (Recommended):**
```bash
make release NEW=1.0.0
```
This automatically builds, copies, and deploys to VPS via SSH + Docker Compose.

## Prerequisites

- VPS with Ubuntu 22.04+
- Docker & Docker Compose installed
- Domain name pointing to VPS (for HTTPS)
- Google Cloud Project with OAuth credentials
- Notion integration token

## SSH Setup (Required for Deploy)

For automated deployment, SSH key authentication is required:

```bash
# On local machine
ssh-keygen -t ed25519 -C "zie-vps-deploy"

# Copy key to VPS
ssh-copy-id zie@ztf.zie-agent.cloud

# Or manually add to VPS ~/.ssh/authorized_keys
```

Test SSH connection:
```bash
ssh zie@ztf.zie-agent.cloud "hostname"
```

## Deployment Steps

### 0. Configure Makefile.local (Local Machine)

Edit `Makefile.local` and set:
```make
VPS_USER = zie
VPS_HOST = ztf.zie-agent.cloud
```

### 1. Prepare VPS

```bash
# SSH to VPS
ssh zie@ztf.zie-agent.cloud

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt update
sudo apt install -y docker-compose

# Re-login for group changes
exit
ssh zie@ztf.zie-agent.cloud
```

### 2. Configure Domain DNS

Point your domain (`ztf.zie-agent.cloud`) to VPS IP via A record.

### 3. Setup on VPS

```bash
# On VPS
mkdir -p ~/zie-test-framework
cd ~/zie-test-framework

# Create .env from example
cp ../server/.env.example .env
nano .env
# Fill in real values:
# - NOTION_API_KEY
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - GOOGLE_SERVICE_ACCOUNT_KEY path
```

### 4. Deploy

#### Option A: Automated via Make (Recommended)

```bash
# From local project root
make release NEW=1.0.0
```

#### Option B: Manual Deploy

```bash
# From local machine
scp -r server/.env zie@ztf.zie-agent.cloud:~/zie-test-framework/
scp -r server/* zie@ztf.zie-agent.cloud:~/zie-test-framework/

# On VPS, start services
cd ~/zie-test-framework
docker-compose up -d
```

### 5. Verify Deployment

```bash
# On VPS
cd ~/zie-test-framework
docker-compose ps
docker-compose logs -f ztf-api
```

### 6. SSL with Caddy (Automatic)

Caddy automatically requests Let's Encrypt certificates. Ensure:
- Domain points to VPS IP
- Port 80/443 open in firewall

### 7. Firewall Setup

```bash
# On VPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database user (default: ztf) |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name (default: ztf) |
| `PORT` | Application port (default: 3000) |
| `NODE_ENV` | Environment (production) |
| `NOTION_API_KEY` | Notion integration token |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Path to service account key |

## Troubleshooting

```bash
# Check service status (on VPS)
docker-compose ps

# View logs
docker-compose logs -f ztf-api
docker-compose logs -f ztf-db
docker-compose logs -f ztf-caddy

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d
```

## SSH Key Setup

For automated deployment, set up SSH key authentication:

```bash
# Generate key (if not exists)
ssh-keygen -t ed25519 -C "zie-vps-deploy"

# Copy to VPS
ssh-copy-id zie@ztf.zie-agent.cloud

# Test connection
ssh zie@ztf.zie-agent.cloud "hostname"
```
