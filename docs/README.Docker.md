# Docker Setup for SACCO Application

This document describes how to run the SACCO application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The application will be available at:
- **Application**: http://localhost:3000
- **Database**: localhost:5432

### 2. Development Mode

```bash
# Start with development settings (hot reload enabled)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. With Database Management Tool

```bash
# Start with pgAdmin
docker-compose --profile tools up -d

# Access pgAdmin at http://localhost:5050
# Email: admin@sacco.com
# Password: admin
```

## Services

### Application (Node.js)
- **Port**: 3000
- **Container**: sacco_app
- **Healthcheck**: HTTP GET on /

### PostgreSQL Database
- **Port**: 5432
- **Container**: sacco_postgres
- **User**: postgres
- **Password**: postgres
- **Database**: sacco
- **Healthcheck**: pg_isready

### pgAdmin (Optional)
- **Port**: 5050
- **Container**: sacco_pgadmin
- **Email**: admin@sacco.com
- **Password**: admin

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Important**: Change the following in production:
- `JWT_SECRET`
- `SESSION_SECRET`
- Database passwords

## Database Initialization

The database schema is automatically initialized on first run using:
- `models/db.sql` - Main database schema

To seed test users:
1. Start the application
2. Visit: http://localhost:3000/auth/seed

## Useful Commands

### Application Management

```bash
# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Restart specific service
docker-compose restart app

# Execute commands in container
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm install <package>
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d sacco

# Backup database
docker-compose exec postgres pg_dump -U postgres sacco > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres sacco < backup.sql

# View database logs
docker-compose logs -f postgres
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker-compose down -v --rmi all --remove-orphans
```

## Volumes

Data is persisted in Docker volumes:
- `postgres_data` - Database files
- `pgadmin_data` - pgAdmin configuration
- `uploads_data` - User uploaded files

## Networking

All services run in the `sacco_network` bridge network and can communicate using service names:
- App connects to database using hostname: `postgres`
- Internal communication doesn't require port mapping

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs app

# Verify database is healthy
docker-compose ps postgres

# Restart services
docker-compose restart
```

### Database connection issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U postgres

# Verify network
docker network inspect sacco_network

# Check environment variables
docker-compose exec app env | grep DB_
```

### Port conflicts

If ports 3000 or 5432 are already in use, update `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Map to different host port
```

## Production Deployment

For production:

1. **Update secrets** in `docker-compose.yml`
2. **Remove development volumes** (source code mounting)
3. **Enable SSL/TLS** using a reverse proxy (nginx/traefik)
4. **Use environment-specific `.env` files**
5. **Set up backups** for PostgreSQL volume
6. **Configure resource limits**:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

## Health Checks

Both services have health checks configured:

- **App**: HTTP GET request to root path
- **PostgreSQL**: pg_isready command

View health status:
```bash
docker-compose ps
```

## Multi-Environment Setup

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production (default)
docker-compose up

# Staging (create docker-compose.staging.yml)
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

## Docker Build Optimization

The Dockerfile uses:
- Multi-stage builds for smaller images
- Alpine Linux base (smaller size)
- Layer caching for faster builds
- Non-root user for security
- Health checks for reliability

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Inspect containers: `docker-compose ps`
- Review [Docker documentation](https://docs.docker.com/)
