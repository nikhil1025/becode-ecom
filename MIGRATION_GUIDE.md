# Database Migration Troubleshooting Guide

## Common Migration Error Codes & Solutions

### P3005: Database schema not empty

**Error:**
```
The database schema is not empty. Read more about how to baseline an existing production database:
https://pris.ly/d/migrate-baseline
```

**Cause:** Database has tables but no `_prisma_migrations` table (migration history).

**Solution:**
```bash
# Baseline with the latest migration
LATEST=$(ls -1 prisma/migrations | sort | tail -n 1)
npx prisma migrate resolve --applied "$LATEST"

# Then deploy any new migrations
npx prisma migrate deploy
```

---

### P3006: Migration failed to apply cleanly

**Error:**
```
Migration `<migration-name>` failed to apply cleanly to a temporary database.
```

**Cause:** Migration has syntax errors or conflicts with existing schema.

**Solution:**
```bash
# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back "<migration-name>"

# Fix the migration SQL or create a new one
npx prisma migrate dev --name fix_migration

# Deploy again
npx prisma migrate deploy
```

---

### P3009: Migrations directory has changed

**Error:**
```
migrate found failed migrations in the target database, new migrations will not be applied.
```

**Cause:** Existing migrations in the database don't match the migrations directory.

**Solution:**
```bash
# List failed migrations
npx prisma migrate status

# Resolve each failed migration
npx prisma migrate resolve --rolled-back "<migration-name>"

# Or if migrations are actually applied
npx prisma migrate resolve --applied "<migration-name>"

# Deploy
npx prisma migrate deploy
```

---

### P2021: Table does not exist

**Error:**
```
The table `<table>` does not exist in the current database.
```

**Cause:** Migration references a table that doesn't exist yet.

**Solution:**
```bash
# Check migration order
ls -1 prisma/migrations

# Reset database (DANGER: Loses all data)
npx prisma migrate reset --force

# Or manually create missing tables
npx prisma db push
```

---

### P1017: Server has closed the connection

**Error:**
```
Server has closed the connection
```

**Cause:** Database connection timeout or wrong connection string.

**Solution:**
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma db pull

# If using localhost in Docker, use host.docker.internal
DATABASE_URL="postgresql://user:pass@host.docker.internal:5432/db"
```

---

## Migration Workflow for Different Scenarios

### Scenario 1: Fresh Database (No tables, no migrations)

```bash
# Generate Prisma Client
npx prisma generate

# Deploy all migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

**Expected Result:** All migrations applied successfully.

---

### Scenario 2: Existing Database with Tables but No Migration History

This is the **PRODUCTION issue** - tables exist but Prisma doesn't know about them.

```bash
# Step 1: Generate Prisma Client
npx prisma generate

# Step 2: Baseline with latest migration
LATEST=$(ls -1 prisma/migrations | grep -v migration_lock.toml | sort | tail -n 1)
npx prisma migrate resolve --applied "$LATEST"

# Step 3: Deploy any new migrations
npx prisma migrate deploy

# Step 4: Verify
npx prisma migrate status
```

**Expected Result:** Existing tables recognized, new migrations applied.

---

### Scenario 3: Production with Some Migrations Applied

```bash
# Step 1: Check status
npx prisma migrate status

# Step 2: Deploy pending migrations
npx prisma migrate deploy

# Step 3: Verify
npx prisma migrate status
```

**Expected Result:** Pending migrations applied successfully.

---

### Scenario 4: Failed Migration in Production

```bash
# Step 1: Check which migration failed
npx prisma migrate status

# Step 2: Mark as rolled back
npx prisma migrate resolve --rolled-back "<failed-migration-name>"

# Step 3: Fix the migration or create a new one
# Edit prisma/migrations/<failed-migration>/migration.sql
# OR create a new migration

# Step 4: Deploy
npx prisma migrate deploy

# Step 5: Verify
npx prisma migrate status
```

---

### Scenario 5: Schema Drift (Manual changes to database)

```bash
# Step 1: Check for drift
npx prisma migrate status

# Step 2: If drift detected, create a new migration to capture changes
npx prisma migrate dev --name capture_manual_changes

# Step 3: Or reset to match schema (DANGER: Loses data)
npx prisma db push --force-reset

# Step 4: Deploy
npx prisma migrate deploy
```

---

## Docker-Specific Migration Commands

### Run migrations in Docker container

```bash
# One-time migration
docker run --rm --env-file .env <image>:latest npx prisma migrate deploy

# Generate Prisma Client in container
docker run --rm --env-file .env <image>:latest npx prisma generate

# Check status
docker run --rm --env-file .env <image>:latest npx prisma migrate status

# In running container
docker exec <container-name> npx prisma migrate deploy
```

---

## Production Deployment Checklist

- [ ] **Backup database** before deploying migrations
- [ ] **Test migrations** on staging environment first
- [ ] **Generate Prisma Client** before starting app
- [ ] **Deploy migrations** before starting new container
- [ ] **Verify migrations** with `npx prisma migrate status`
- [ ] **Check logs** for any Prisma errors
- [ ] **Test API endpoints** after deployment
- [ ] **Monitor for errors** in production logs

---

## Automated Migration Script

```bash
#!/bin/bash
# Safe migration deployment script

set -e

echo "🔍 Starting migration deployment..."

# Step 1: Backup database (if needed)
echo "💾 Backing up database..."
# Add your backup command here

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Step 3: Check current migration status
echo "📊 Checking migration status..."
npx prisma migrate status || true

# Step 4: Deploy migrations
echo "📦 Deploying migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️ Migration deployment had warnings"
  
  # Check for P3005 error (baseline needed)
  if npx prisma migrate status 2>&1 | grep -q "P3005"; then
    echo "📝 Baselining database..."
    LATEST=$(ls -1 prisma/migrations | grep -v migration_lock.toml | sort | tail -n 1)
    npx prisma migrate resolve --applied "$LATEST"
    npx prisma migrate deploy
  fi
fi

# Step 5: Final verification
echo "📊 Final status:"
npx prisma migrate status

echo "✅ Migration deployment complete!"
```

---

## Troubleshooting Commands

```bash
# Check which migrations are applied
npx prisma migrate status

# See migration history in database
psql -d <database> -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;"

# Check if tables exist
psql -d <database> -c "\dt"

# See specific table schema
psql -d <database> -c "\d <table_name>"

# Test database connection
npx prisma db pull

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema without migrations (dev only)
npx prisma db push

# Reset database (DANGER: Loses all data)
npx prisma migrate reset --force

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Mark migration as applied (skip execution)
npx prisma migrate resolve --applied "<migration_name>"

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back "<migration_name>"
```

---

## Common Issues & Quick Fixes

### Issue: "Prisma Client not generated"

```bash
# Solution
npx prisma generate
```

### Issue: "Database not reachable"

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
nc -zv <host> <port>
```

### Issue: "Migration already applied"

```bash
# Check status
npx prisma migrate status

# If shows as pending but actually applied
npx prisma migrate resolve --applied "<migration_name>"
```

### Issue: "Cannot find module '@prisma/client'"

```bash
# Reinstall and regenerate
npm install @prisma/client
npx prisma generate
```

### Issue: "Table already exists"

```bash
# Mark migration as applied
LATEST=$(ls -1 prisma/migrations | grep -v migration_lock.toml | sort | tail -n 1)
npx prisma migrate resolve --applied "$LATEST"
```

---

## Environment-Specific Tips

### Development
```bash
# Use migrate dev (creates and applies migrations)
npx prisma migrate dev --name <name>

# Reset database anytime
npx prisma migrate reset --force
```

### Staging
```bash
# Use migrate deploy (only applies existing migrations)
npx prisma migrate deploy

# Test before production
npx prisma migrate status
```

### Production
```bash
# ALWAYS backup first
# ALWAYS test on staging first
# Use migrate deploy (NEVER migrate dev)
npx prisma migrate deploy

# Monitor logs
npx prisma migrate status
```

---

## Prevention Best Practices

1. **Always generate Prisma Client** after schema changes
2. **Test migrations on staging** before production
3. **Backup database** before migrations
4. **Use version control** for migrations
5. **Never edit applied migrations** (create new ones instead)
6. **Document manual schema changes**
7. **Use `prisma migrate deploy`** in production (not `migrate dev`)
8. **Monitor migration status** regularly
9. **Keep migrations small** and focused
10. **Test rollback procedures** on staging

---

## Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Baselining Production Databases](https://www.prisma.io/docs/guides/migrate/production-troubleshooting#baselining-a-production-database)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
