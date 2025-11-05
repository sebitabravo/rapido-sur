# Deployment Guide - Rápido Sur

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- PostgreSQL 15+ (if not using Docker)

## Quick Start with Docker

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd rapido-sur-frontend
   \`\`\`

2. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Deploy with Docker Compose**
   \`\`\`bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   \`\`\`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

## Manual Deployment

### Frontend (Next.js)

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

3. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

### Backend (Spring Boot)

Refer to the backend repository for deployment instructions.

## Docker Commands

### Build and run
\`\`\`bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

### Individual services
\`\`\`bash
# Build frontend only
npm run docker:build

# Run frontend only
npm run docker:run
\`\`\`

## Database Management

### Backup
\`\`\`bash
chmod +x scripts/backup.sh
./scripts/backup.sh
\`\`\`

Backups are stored in `./backups/` directory.

### Restore
\`\`\`bash
chmod +x scripts/restore.sh
./scripts/restore.sh backups/rapido_sur_backup_YYYYMMDD_HHMMSS.sql.gz
\`\`\`

## Production Deployment

### Using Nginx (Recommended)

1. **Configure SSL certificates**
   \`\`\`bash
   mkdir ssl
   # Copy your SSL certificates to ./ssl/
   \`\`\`

2. **Update nginx.conf**
   - Uncomment HTTPS configuration
   - Update server_name with your domain

3. **Deploy**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

### Environment Variables

Required environment variables for production:

\`\`\`env
# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Backend
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/rapido_sur
SPRING_DATASOURCE_USERNAME=rapido_sur_user
SPRING_DATASOURCE_PASSWORD=<secure-password>
JWT_SECRET=<secure-jwt-secret>
\`\`\`

## Monitoring

### Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/health
- Nginx: http://localhost/health

### Logs

\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
\`\`\`

## Troubleshooting

### Services won't start
\`\`\`bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose up -d --build
\`\`\`

### Database connection issues
\`\`\`bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Connect to database
docker exec -it rapido-sur-db psql -U rapido_sur_user rapido_sur
\`\`\`

### Port conflicts
If ports 3000, 8080, or 5432 are already in use, update the port mappings in `docker-compose.yml`.

## Security Checklist

- [ ] Change default database password
- [ ] Generate secure JWT secret (minimum 256 bits)
- [ ] Configure SSL certificates for HTTPS
- [ ] Set up firewall rules
- [ ] Enable rate limiting in Nginx
- [ ] Regular database backups
- [ ] Keep Docker images updated
- [ ] Monitor application logs

## Performance Optimization

1. **Enable caching in Nginx**
2. **Configure CDN for static assets**
3. **Database connection pooling**
4. **Enable gzip compression**
5. **Optimize Docker images**

## Scaling

### Horizontal Scaling

\`\`\`yaml
# docker-compose.yml
services:
  frontend:
    deploy:
      replicas: 3
\`\`\`

### Load Balancing

Configure Nginx upstream with multiple backend servers.

## Support

For issues or questions, please contact the development team or open an issue in the repository.
