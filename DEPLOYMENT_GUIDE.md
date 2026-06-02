# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] MongoDB database set up (Atlas or self-hosted)
- [ ] SSL certificate obtained
- [ ] Domain name configured
- [ ] Backup strategy planned
- [ ] Monitoring tools set up
- [ ] Security headers configured

---

## Deployment Options

### Option 1: Heroku (Easiest - Free tier available)

#### Prerequisites
- Heroku CLI installed
- Git installed
- GitHub repository

#### Steps

**1. Create Heroku App**
```bash
heroku login
heroku create bayanihanhub-prod
```

**2. Set Environment Variables**
```bash
heroku config:set PORT=5000
heroku config:set MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bayanihanhub
heroku config:set JWT_SECRET=your_super_secure_secret_key_here_minimum_32_chars
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set CLIENT_URL=https://bayanihanhub-prod.herokuapp.com
heroku config:set NODE_ENV=production
```

**3. Deploy**
```bash
git push heroku main
```

**4. View Logs**
```bash
heroku logs --tail
```

**5. Access Application**
```
Frontend: https://bayanihanhub-prod.herokuapp.com
API: https://bayanihanhub-prod.herokuapp.com/api
```

---

### Option 2: DigitalOcean (Recommended)

#### Prerequisites
- DigitalOcean account
- SSH key pair
- Domain name (optional)

#### Steps

**1. Create Droplet**
- Image: Ubuntu 22.04 LTS
- Plan: $5/month (512MB RAM minimum)
- Region: Choose closest to users
- Add SSH key for authentication

**2. SSH into Droplet**
```bash
ssh root@your_droplet_ip
```

**3. Update System**
```bash
apt update
apt upgrade -y
```

**4. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

**5. Install MongoDB**
```bash
apt install -y mongodb
systemctl start mongodb
systemctl enable mongodb
```

Or use MongoDB Atlas cloud instead (recommended for production).

**6. Install Git & Clone Repository**
```bash
apt install -y git
cd /var/www
git clone https://github.com/yourusername/bayanihanhub.git
cd bayanihanhub
```

**7. Install Dependencies**
```bash
npm run install:all
```

**8. Configure Environment**
```bash
nano server/.env
```
Add your production environment variables.

**9. Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

**10. Start Application**
```bash
pm2 start "npm start --prefix server" --name bayanihanhub
pm2 start "npm start --prefix client" --name bayanihanhub-client
pm2 save
pm2 startup
```

**11. Install Nginx (Reverse Proxy)**
```bash
apt install -y nginx
```

**12. Configure Nginx**
```bash
nano /etc/nginx/sites-available/default
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**13. Enable Nginx**
```bash
systemctl restart nginx
systemctl enable nginx
```

**14. Set Up SSL (Let's Encrypt)**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

### Option 3: AWS (EC2 + RDS)

#### Prerequisites
- AWS account
- AWS CLI installed

#### Steps

**1. Launch EC2 Instance**
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.micro (free tier eligible)
- Security Group: Allow 80, 443, 22

**2. Connect to Instance**
```bash
ssh -i your_key.pem ubuntu@your_instance_ip
```

**3. Update & Install**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git nginx
```

**4. Set Up RDS (MongoDB or use Atlas)**
- Launch RDS database
- Configure security group
- Get connection string

**5. Follow steps 6-14 from DigitalOcean guide above

---

### Option 4: Docker (Production-Ready)

**Create Dockerfile for Backend:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --production

COPY server/src ./src

EXPOSE 5000
CMD ["node", "src/server.js"]
```

**Create Dockerfile for Frontend:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose (docker-compose.yml):**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: bayanihanhub

  backend:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGO_URI: mongodb://mongodb:27017/bayanihanhub
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

## Production Configuration

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://prod:password@cluster.mongodb.net/bayanihanhub
JWT_SECRET=your_64_character_super_secure_random_string_here_must_be_long
JWT_EXPIRES_IN=7d
CLIENT_URL=https://yourdomain.com
```

### Security Hardening

**1. Enable HTTPS/SSL**
- Use Let's Encrypt (free)
- Redirect all HTTP to HTTPS
- Set HSTS header

**2. Database Security**
- Use strong passwords
- Enable MongoDB authentication
- Restrict network access to database
- Regular backups

**3. Application Security**
- Disable debug mode
- Enable CORS only for your domain
- Add rate limiting
- Implement request logging
- Use security headers

**4. Server Security**
- Keep OS and packages updated
- Use firewall
- Disable SSH password login (use keys only)
- Monitor logs for suspicious activity
- Regular security audits

---

## Monitoring & Maintenance

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs bayanihanhub

# Restart application
pm2 restart bayanihanhub
```

### Database Backup
```bash
# Manual MongoDB backup
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net/bayanihanhub" --out /backups/bayanihanhub

# Restore from backup
mongorestore --uri="mongodb+srv://user:password@cluster.mongodb.net" /backups/bayanihanhub
```

### Log Monitoring
```bash
# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View application logs
pm2 logs
```

### Health Checks
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "BayanihanHub backend is running",
  "environment": "production",
  "timestamp": "2026-05-30T10:00:00.000Z"
}
```

---

## Scaling & Performance

### Increase Server Resources
- Add more CPU cores
- Increase RAM
- Use CDN for static assets
- Enable database query caching

### Load Balancing (Multiple Servers)
- Use load balancer (AWS ELB, DigitalOcean LB)
- Deploy application on multiple servers
- Use MongoDB replica set for high availability

### Caching Strategy
- Implement Redis for session storage
- Cache API responses
- Use browser caching headers

---

## Troubleshooting Deployment

### Application Won't Start
```bash
# Check logs
pm2 logs bayanihanhub

# Check Node.js version
node -v

# Verify environment variables
printenv | grep -i mongo
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongo "mongodb+srv://user:password@cluster.mongodb.net/bayanihanhub"

# Verify security group/firewall allows access
# Check database credentials in .env
```

### CORS Errors
```
Access to XMLHttpRequest at 'https://api.yourdomain.com' has been blocked by CORS policy
```

Solution: Update CLIENT_URL in environment variables to match your frontend domain.

### Out of Memory
- Check application logs for memory leaks
- Increase server RAM
- Implement caching
- Optimize database queries

---

## Rollback Procedure

If something goes wrong after deployment:

```bash
# Stop application
pm2 stop bayanihanhub

# Revert code
git revert <commit_hash>
npm install
npm run seed --prefix server

# Start application
pm2 start bayanihanhub

# Check health
curl https://yourdomain.com/api/health
```

---

## Performance Targets

- Page load time: < 3 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Uptime: > 99.9%
- Error rate: < 0.1%

---

## Support Resources

- **Heroku Docs**: https://devcenter.heroku.com
- **DigitalOcean Docs**: https://docs.digitalocean.com
- **AWS Documentation**: https://docs.aws.amazon.com
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Nginx Documentation**: https://nginx.org/en/docs/

---

**Last Updated**: May 2026  
**Status**: Production Ready ✅
