# Surf DQT Docker Setup

This guide covers running Surf DQT (Douglas Data Query Tool) using Docker in both local development and production environments.

## Architecture

The application consists of three services:
- **Frontend**: Nuxt 2 SPA served by Nginx (port 3457)
- **Backend**: Express.js API with Node 16 (port 3458)
- **MongoDB**: Database for storing application data (port 27017)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- For local development: SSL certificates (see below)

## Quick Start

### Local Development

1. **Generate SSL Certificates** (first time only):

```bash
cd backend

# Generate self-signed certificates for local HTTPS
openssl req -x509 -newkey rsa:4096 -keyout localhost_key.pem -out localhost_cert.pem -days 365 -nodes -subj "/CN=localhost"
```

2. **Create Environment File**:

```bash
# Copy the local development template
cp .env.local.example backend/.env

# Edit backend/.env with your values (or use defaults for local dev)
```

3. **Start Services**:

```bash
# From the surf-dqt directory
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or run in background:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

4. **Access the Application**:

- Frontend: https://localhost:3457
- Backend API: https://localhost:3458
- MongoDB: localhost:27017

5. **Stop Services**:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# To also remove volumes (delete all data):
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

### Production Deployment (Ubuntu Server)

1. **Prepare Environment**:

```bash
# Copy production template
cp .env.prod.example backend/.env

# IMPORTANT: Edit backend/.env and set secure passwords!
nano backend/.env
```

Generate secure secrets:
```bash
# Generate random secrets for SESSION and PASSPORT
openssl rand -base64 32
```

2. **Start Services**:

```bash
# Use both base and production compose files
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

3. **Configure Nginx Reverse Proxy**:

Add this to your existing nginx configuration on the host:

```nginx
# Frontend
location / {
    proxy_pass http://localhost:3457;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Backend API
location /api {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://localhost:3458;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Note: In production, containers don't expose ports directly - they're only accessible through the nginx reverse proxy.

4. **View Logs**:

```bash
# All services
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
```

5. **Stop Services**:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `development` or `production` |
| `SERVER_ENV` | Server environment (controls SSL) | `development` or `production` |
| `DATABASE_NAME` | MongoDB database name | `Douglas_Production` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://mongodb:27017/Douglas_Production` |
| `EXPRESS_SESSION_SECRET` | Session encryption key | Generate with `openssl rand -base64 32` |
| `EXPRESS_SESSION_NAME` | Session cookie name | `surf-dqt-session` |
| `PASSPORT_SECRET` | JWT secret key | Generate with `openssl rand -base64 32` |
| `SURF_USERNAME` | Admin username | `admin@example.com` |
| `SURF_PWD` | Admin password | Strong password |

### Production-Only Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_USERNAME` | MongoDB admin username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | Strong password |
| `DATABASE_USER` | MongoDB database user | Same as `MONGO_ROOT_USERNAME` |
| `DATABASE_PASSWORD` | MongoDB database password | Same as `MONGO_ROOT_PASSWORD` |

## File Structure

```
surf-dqt/
├── docker-compose.yml              # Base configuration (common)
├── docker-compose.dev.yml          # Local dev overrides (explicit)
├── docker-compose.prod.yml         # Production overrides (explicit)
├── .env.example                    # Environment variables template
├── .env.local.example              # Local development defaults
├── .env.prod.example               # Production defaults
├── backend/
│   ├── Dockerfile
│   ├── .env                        # Your actual environment variables
│   ├── localhost_key.pem           # Local SSL key (gitignored)
│   └── localhost_cert.pem          # Local SSL cert (gitignored)
└── frontend/
    ├── Dockerfile
    └── nginx.conf
```

## Docker Compose Files Explained

### docker-compose.yml (Base)
Common configuration shared by all environments:
- Service definitions
- Network setup
- Base environment variables
- Health checks

### docker-compose.dev.yml (Local Dev)
Explicitly loaded with `-f` flag for local development:
- Exposes all ports for direct access
- Mounts SSL certificates
- Sets `SERVER_ENV=development`
- MongoDB without authentication
- Hot reload with volume mounts
- Restart policies

### docker-compose.prod.yml (Production)
Explicitly loaded with `-f` flag for production:
- No exposed ports (internal only)
- MongoDB with authentication
- Sets `SERVER_ENV=production`
- Persistent volumes
- Restart policies

## Common Tasks

### View Running Containers

```bash
# Local
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

### Rebuild After Code Changes

```bash
# Local
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Access Container Shell

```bash
# Backend
docker exec -it surf-dqt-backend sh

# MongoDB
docker exec -it surf-dqt-mongodb mongosh
```

### Backup MongoDB Data

The backend includes an archiver cron that uses `mongodump`. You can also manually backup:

```bash
docker exec surf-dqt-mongodb mongodump --db=Douglas_Production --out=/data/backup
docker cp surf-dqt-mongodb:/data/backup ./backup
```

### Restore MongoDB Data

```bash
docker cp ./backup surf-dqt-mongodb:/data/backup
docker exec surf-dqt-mongodb mongorestore /data/backup
```

### View MongoDB Data

```bash
# Connect to MongoDB shell
docker exec -it surf-dqt-mongodb mongosh Douglas_Production

# List collections
show collections

# Query data
db.results.find().limit(5)
```

## Troubleshooting

### Backend won't start - SSL certificate error

**Problem**: Backend crashes with "ENOENT: no such file or directory, open 'localhost_key.pem'"

**Solution**: Generate SSL certificates (see Quick Start step 1) or ensure they're in the `backend/` directory.

### Frontend can't connect to backend

**Problem**: Frontend shows connection errors or API calls fail.

**Solution**: 
- Check that `BACKEND_URL` environment variable is set correctly in docker-compose files
- Verify backend is running: `docker-compose logs backend`
- Check CORS settings in `backend/config.js`

### MongoDB connection failed

**Problem**: Backend logs show "MongoServerError: Authentication failed"

**Solution**:
- Verify `DATABASE_URL` includes correct credentials
- In production, ensure `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD` match
- Check MongoDB is healthy: `docker-compose ps`

### Port already in use

**Problem**: "Error: bind: address already in use"

**Solution**:
```bash
# Find what's using the port
lsof -i :3457  # or :3458, :27017

# Stop the conflicting service or change ports in docker-compose files
```

### Cannot access application from browser

**Local Development**:
- Ensure you're using `https://` (not `http://`)
- Accept the self-signed certificate warning in your browser
- Check firewall settings

**Production**:
- Verify nginx reverse proxy is configured and running
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Ensure SSL certificates are valid
- Verify DNS is pointing to your server

### Container keeps restarting

```bash
# Check logs for errors
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - MongoDB not ready (wait for health check)
# - SSL certificate issues in development
```

### Data persists after docker-compose down

This is expected! MongoDB data is stored in a named volume. To remove:

```bash
# Remove volumes (deletes all data)
# Local
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

## Development Workflow

### Making Code Changes

**Frontend**:
1. Make changes to frontend code
2. Rebuild: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend`
3. Refresh browser (or use hot reload if mounted)

**Backend**:
1. Make changes to backend code
2. Backend will restart automatically (nodemon watches for changes)

### Hot Reload

The `docker-compose.dev.yml` file mounts source code as volumes for hot reload:

```yaml
services:
  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
```

## Security Notes

### Local Development
- Self-signed certificates will show browser warnings (this is normal)
- Default passwords in `.env.local.example` are for development only
- MongoDB has no authentication in local mode

### Production
- **Always** change default passwords in `.env`
- Use strong, randomly generated secrets
- Keep `.env` file secure (never commit to git)
- MongoDB authentication is enabled
- SSL is handled by nginx reverse proxy
- Containers are not exposed to the internet directly

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nuxt 2 Documentation](https://nuxtjs.org/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## Support

For issues specific to the Docker setup, check:
1. Container logs: `docker-compose logs`
2. Container status: `docker-compose ps`
3. Environment variables: `docker-compose config`
