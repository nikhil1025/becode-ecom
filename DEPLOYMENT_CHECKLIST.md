# 🎯 Deployment Checklist

## Pre-Deployment

### 1. Environment Setup

- [ ] Create `.env` file from `.env.example`
- [ ] Set `DATABASE_URL` (PostgreSQL connection string)
- [ ] Set `JWT_SECRET` (strong random string)
- [ ] Set `ADMIN_JWT_SECRET` (different from JWT_SECRET)
- [ ] Set `FRONTEND_URL` (your frontend domain)
- [ ] Set `BASE_URL` (your backend domain)
- [ ] Set payment keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
- [ ] Optional: Set AWS S3 credentials
- [ ] Optional: Set SendGrid API key
- [ ] Optional: Set Google OAuth credentials

### 2. Database Setup

- [ ] PostgreSQL server is running and accessible
- [ ] Database created
- [ ] Connection string tested
- [ ] Network access configured (if remote)

### 3. Server Requirements

- [ ] Docker installed (20.10+)
- [ ] Docker Compose installed (optional)
- [ ] Git installed
- [ ] Ports 3001 available
- [ ] Minimum 2GB RAM available
- [ ] Minimum 10GB disk space

## Local Testing

### 4. Test Build Locally

```bash
cd bcode-ecom
./test-docker.sh
```

- [ ] Docker build completes successfully
- [ ] Container starts without errors
- [ ] Health check passes (http://localhost:3001/api/health)
- [ ] Can access API endpoints
- [ ] Database migrations applied
- [ ] No error logs

### 5. Verify Functionality

- [ ] Test authentication endpoints
- [ ] Test product endpoints
- [ ] Test file uploads (if applicable)
- [ ] Test order creation (if applicable)
- [ ] Check logs for warnings/errors

## Production Deployment

### 6. Initial Deployment

```bash
cd bcode-ecom
./deploy.sh deploy
```

- [ ] Script runs without errors
- [ ] Container starts successfully
- [ ] Health check passes
- [ ] Application accessible on port 3001
- [ ] Logs show no errors

### 7. Post-Deployment Verification

- [ ] Health endpoint working: `curl http://your-server:3001/api/health`
- [ ] API endpoints responding
- [ ] Database connectivity confirmed
- [ ] File uploads working (check /app/uploads)
- [ ] CORS configured correctly
- [ ] SSL/TLS configured (if applicable)

### 8. Monitoring Setup

- [ ] Container auto-restart configured
- [ ] Log rotation configured
- [ ] Health check monitoring
- [ ] Disk space monitoring
- [ ] Database backup scheduled

## Troubleshooting Commands

### If Build Fails

```bash
# Clean build
docker build --no-cache -t bcode-ecom:latest .

# Check build logs
docker build --progress=plain .
```

### If Container Won't Start

```bash
# Check logs
docker logs bcode-backend

# Check if port is in use
sudo netstat -tlnp | grep 3001

# Test inside container
docker exec -it bcode-backend sh
```

### If Database Connection Fails

```bash
# Test from container
docker exec -it bcode-backend sh -c 'npx prisma db pull'

# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:5432/dbname
```

### If Health Check Fails

```bash
# Check if app is running
docker exec bcode-backend ps aux | grep node

# Test health from inside
docker exec bcode-backend wget -O- http://localhost:3001/api/health

# Check port binding
docker port bcode-backend
```

## Rollback Procedure

### If Deployment Fails

```bash
# Automatic rollback
./deploy.sh rollback

# Manual rollback
docker stop bcode-backend
docker rm bcode-backend
docker run -d \
  --name bcode-backend \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  bcode-ecom:backup-TIMESTAMP
```

## GitHub Actions Setup (Optional)

### 9. CI/CD Configuration

If using GitHub Actions:

- [ ] Add secrets to GitHub repository:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `ADMIN_JWT_SECRET`
  - `FRONTEND_URL`
  - `BASE_URL`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SSH_PRIVATE_KEY`
  - `SERVER_HOST`
  - `SERVER_USER`
  - Optional: AWS, Google, SendGrid secrets

- [ ] Workflow file exists: `.github/workflows/backend-deploy.yml`
- [ ] SSH access configured on server
- [ ] Test workflow with a commit

## Security Checklist

### 10. Security Hardening

- [ ] No sensitive data in `.env` committed to Git
- [ ] Strong JWT secrets (32+ characters, random)
- [ ] Database password is strong
- [ ] Container runs as non-root user
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL/TLS enabled for production
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place

## Performance Optimization

### 11. Production Tuning

- [ ] Database connection pooling configured
- [ ] Redis cache setup (optional)
- [ ] CDN for static files (optional)
- [ ] Gzip compression enabled
- [ ] Request rate limiting configured
- [ ] Database indexes optimized

## Maintenance

### 12. Regular Maintenance

- [ ] Log rotation configured
- [ ] Old Docker images cleaned up
- [ ] Database backups verified
- [ ] Disk space monitored
- [ ] Application logs reviewed
- [ ] Security updates applied

## Quick Commands

```bash
# View logs
docker logs -f bcode-backend

# Restart app
docker restart bcode-backend

# Check status
docker ps | grep bcode-backend

# Access container
docker exec -it bcode-backend sh

# Check health
curl http://localhost:3001/api/health

# Redeploy
./deploy.sh deploy

# Stop app
docker stop bcode-backend

# View resource usage
docker stats bcode-backend
```

## Success Criteria

Your deployment is successful when:

✅ Container shows as "healthy" in `docker ps`
✅ Health endpoint returns `{"status":"ok"}`
✅ API endpoints respond correctly
✅ Database migrations applied
✅ No errors in logs
✅ Application auto-restarts on failure
✅ Files persist across restarts (uploads volume)

---

**Notes:**

- Keep `.env` file secure and never commit it
- Test rollback procedure before you need it
- Monitor logs regularly for issues
- Keep backups of database and uploads
- Document any custom configurations

**For support:**

- Check logs: `docker logs -f bcode-backend`
- Review: `DEPLOYMENT_FIX_SUMMARY.md`
- Docker docs: `DOCKER_BUILD.md`
