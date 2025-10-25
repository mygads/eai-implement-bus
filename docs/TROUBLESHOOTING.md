# 🔧 Troubleshooting Guide

Panduan mengatasi masalah umum yang mungkin terjadi.

---

## 📑 Daftar Isi

- [Container Issues](#-container-issues)
- [Database Issues](#-database-issues)
- [API Issues](#-api-issues)
- [Network Issues](#-network-issues)
- [Seeding Issues](#-seeding-issues)
- [Performance Issues](#-performance-issues)

---

## 🐳 Container Issues

### Problem: Container tidak start

**Symptoms:**
```
docker-compose ps
# Shows container as "Exited" or "Restarting"
```

**Solutions:**

1. **Check logs:**
```powershell
docker-compose logs [service-name]
```

2. **Common causes & fixes:**

**Port already in use:**
```powershell
# Find which process using the port
netstat -ano | findstr :8080

# Option 1: Kill the process
taskkill /PID [PID] /F

# Option 2: Change port in docker-compose.yml
# Edit: "8080:3000" to "8081:3000"
```

**Build error:**
```powershell
# Rebuild specific service
docker-compose up -d --build [service-name]

# Rebuild all
docker-compose down
docker-compose up -d --build
```

**Insufficient resources:**
- Increase Docker Desktop memory allocation
- Close other applications
- Restart Docker Desktop

---

### Problem: Container stuck in "Starting" state

**Symptoms:**
```
docker-compose ps
# Shows container status as "starting" for > 60 seconds
```

**Solutions:**

1. **Wait longer (database initialization):**
```powershell
Start-Sleep -Seconds 60
docker-compose ps
```

2. **Check logs for errors:**
```powershell
docker-compose logs [service-name]
```

3. **Restart the container:**
```powershell
docker-compose restart [service-name]
```

4. **Full reset:**
```powershell
docker-compose down
docker-compose up -d --build
```

---

### Problem: Cannot stop containers

**Symptoms:**
```
docker-compose down
# Hangs or times out
```

**Solutions:**

1. **Force stop:**
```powershell
docker-compose down --timeout 5
```

2. **Kill containers directly:**
```powershell
docker ps -q | ForEach-Object { docker kill $_ }
```

3. **Restart Docker Desktop**

---

## 🗄️ Database Issues

### Problem: Database connection timeout

**Symptoms:**
```
Error: connect ETIMEDOUT
Error: could not connect to server
Error: unable to open database file
```

**Solutions:**

1. **Wait for database initialization:**
```powershell
# Databases need 30-60 seconds to initialize
Start-Sleep -Seconds 60
```

2. **Check database container status:**
```powershell
docker-compose ps db-pendapatan
docker-compose ps db-pu
docker-compose ps db-kesehatan
```

3. **Check database logs:**
```powershell
docker-compose logs db-pendapatan
docker-compose logs db-pu
docker-compose logs db-kesehatan
```

4. **Restart database container:**
```powershell
docker-compose restart db-pendapatan
```

5. **Reset database (delete data):**
```powershell
docker-compose down -v
docker-compose up -d --build
```

---

### Problem: Database not seeded

**Symptoms:**
```
API returns empty array: { "success": true, "data": [] }
```

**Solutions:**

1. **Check if AUTO_SEED is enabled:**
```powershell
# Check environment variable in docker-compose.yml
# Should NOT have: AUTO_SEED=false
```

2. **Manual seed:**
```powershell
.\seed-all.ps1
```

3. **Check seed files exist:**
```powershell
# Verify seed files
docker exec service-kependudukan ls -la /var/www/html/seed_data.sql
docker exec service-pendapatan ls -la /app/seed_data.sql
docker exec service-pu ls -la /app/seed_data.sql
docker exec service-kesehatan ls -la /app/seed_data.js
```

4. **Check data count:**
```powershell
# Kependudukan
docker exec service-kependudukan sqlite3 /var/www/html/data/kependudukan.db "SELECT COUNT(*) FROM penduduk;"

# Should return: 5
```

---

### Problem: SQLite database locked

**Symptoms:**
```
Error: database is locked
```

**Solutions:**

1. **Restart service:**
```powershell
docker-compose restart service-kependudukan
```

2. **Delete database file and restart:**
```powershell
docker exec service-kependudukan rm /var/www/html/data/kependudukan.db
docker-compose restart service-kependudukan
```

---

### Problem: PostgreSQL authentication failed

**Symptoms:**
```
Error: password authentication failed for user "postgres"
```

**Solutions:**

1. **Check environment variables in docker-compose.yml:**
```yaml
db-pendapatan:
  environment:
    POSTGRES_PASSWORD: postgres123
    
service-pendapatan:
  environment:
    DB_PASSWORD: postgres123  # Must match!
```

2. **Reset PostgreSQL:**
```powershell
docker-compose down
docker volume rm eai-implement-bus_pendapatan-db-data
docker-compose up -d --build
```

---

### Problem: MySQL access denied

**Symptoms:**
```
Error: Access denied for user 'root'@'...'
```

**Solutions:**

1. **Check credentials in docker-compose.yml:**
```yaml
db-pu:
  environment:
    MYSQL_ROOT_PASSWORD: mysql123

# Connection string in Go should use same password
```

2. **Reset MySQL:**
```powershell
docker-compose down
docker volume rm eai-implement-bus_pu-db-data
docker-compose up -d --build
```

---

### Problem: MongoDB connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED
MongoServerError: connection refused
```

**Solutions:**

1. **Wait for MongoDB to start:**
```powershell
Start-Sleep -Seconds 30
```

2. **Check MongoDB container:**
```powershell
docker-compose logs db-kesehatan
```

3. **Restart MongoDB:**
```powershell
docker-compose restart db-kesehatan
Start-Sleep -Seconds 20
docker-compose restart service-kesehatan
```

---

## 🌐 API Issues

### Problem: 401 Unauthorized

**Symptoms:**
```json
{
  "success": false,
  "message": "API key is required"
}
```

**Solutions:**

1. **Add API Key header:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/..." -Headers $headers
```

2. **Valid API Keys:**
- `demo-api-key-12345`
- `test-key-67890`
- `admin-key-abcde`

---

### Problem: 403 Forbidden

**Symptoms:**
```json
{
  "success": false,
  "message": "Invalid API key"
}
```

**Solutions:**

1. **Check API Key spelling:**
```powershell
# Correct
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

# Wrong (case sensitive)
$headers = @{ "X-API-Key" = "DEMO-API-KEY-12345" }
```

2. **Use valid API key from list above**

---

### Problem: 404 Not Found

**Symptoms:**
```
404 Not Found
or
{ "success": false, "message": "Data not found" }
```

**Solutions:**

1. **Check endpoint URL:**
```powershell
# Correct
http://localhost:8080/api/warga/3201012345678901/profil

# Wrong
http://localhost:8080/warga/3201012345678901/profil  # Missing /api
```

2. **Check NIK exists:**
```powershell
# Valid test NIKs:
# 3201012345678901 - Budi Santoso
# 3201012345678902 - Siti Aminah
# 3201012345678903 - Ahmad Wijaya
# 3201012345678904 - Dewi Lestari
# 3201012345678905 - Rudi Hartono
```

3. **Check data seeded:**
```powershell
.\seed-all.ps1
```

---

### Problem: 500 Internal Server Error

**Symptoms:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Solutions:**

1. **Check service logs:**
```powershell
docker-compose logs api-gateway
docker-compose logs service-kependudukan
```

2. **Check all services running:**
```powershell
docker-compose ps
# All should show "running"
```

3. **Restart services:**
```powershell
docker-compose restart
```

---

### Problem: 503 Service Unavailable

**Symptoms:**
```json
{
  "success": false,
  "message": "Service unavailable"
}
```

**Solutions:**

1. **Check backend service status:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers
```

2. **Restart unhealthy service:**
```powershell
docker-compose restart service-kesehatan
```

3. **Check service logs:**
```powershell
docker-compose logs service-kesehatan
```

---

### Problem: Aggregator returns partial data

**Symptoms:**
```json
{
  "success": true,
  "data": {
    "penduduk": { ... },
    "kesehatan": [],      // Empty
    "infrastruktur": [],  // Empty
    "pajak": [ ... ]
  }
}
```

**Solutions:**

**This is EXPECTED behavior!** Aggregator menggunakan fault tolerance:
- Jika 1 service down → return empty array untuk service tersebut
- Service lain tetap return data
- System tetap usable

**To fix:**
1. **Check which service is down:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers
```

2. **Restart unhealthy service:**
```powershell
docker-compose restart service-kesehatan
docker-compose restart service-pu
```

---

## 🌐 Network Issues

### Problem: Cannot access API Gateway

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8080
```

**Solutions:**

1. **Check if container running:**
```powershell
docker-compose ps api-gateway
```

2. **Check port binding:**
```powershell
netstat -ano | findstr :8080
# Should show Docker process
```

3. **Try different port:**
```yaml
# Edit docker-compose.yml
api-gateway:
  ports:
    - "8081:3000"  # Change from 8080 to 8081
```

4. **Check firewall:**
- Allow Docker Desktop in Windows Firewall
- Allow port 8080 in firewall

---

### Problem: Service can't reach database

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND db-pendapatan
Error: dial tcp: lookup db-pu: no such host
```

**Solutions:**

1. **Check network:**
```powershell
docker network ls
# Should see: eai-implement-bus_soa-network
```

2. **Recreate network:**
```powershell
docker-compose down
docker-compose up -d
```

3. **Check services in same network:**
```powershell
docker network inspect eai-implement-bus_soa-network
# Should list all containers
```

---

### Problem: Gateway can't reach backend services

**Symptoms:**
```
Error: fetch failed
Error: ECONNREFUSED
```

**Solutions:**

1. **Check service URLs in gateway code:**
```javascript
// Should use container names, not localhost
const SERVICES = {
  kependudukan: 'http://service-kependudukan',  // ✅ Correct
  pendapatan: 'http://localhost:3002',          // ❌ Wrong
};
```

2. **Check all services running:**
```powershell
docker-compose ps
```

3. **Check service health directly:**
```powershell
docker exec api-gateway sh -c "wget -O- http://service-kependudukan/health"
```

---

## 🌱 Seeding Issues

### Problem: Seed script not found

**Symptoms:**
```
sh: /app/seed.sh: not found
node: cannot find module '/app/seed.js'
```

**Solutions:**

1. **Rebuild container:**
```powershell
docker-compose up -d --build [service-name]
```

2. **Verify seed file in container:**
```powershell
docker exec service-kependudukan ls -la /var/www/html/seed.sh
docker exec service-pendapatan ls -la /app/seed.py
```

3. **Check Dockerfile COPY commands:**
```dockerfile
COPY seed_data.sql /app/
COPY seed.py /app/
```

---

### Problem: Permission denied on seed script

**Symptoms:**
```
sh: /app/seed.sh: Permission denied
```

**Solutions:**

1. **Fix permissions in Dockerfile:**
```dockerfile
COPY seed.sh /app/
RUN chmod +x /app/seed.sh
```

2. **Rebuild:**
```powershell
docker-compose up -d --build [service-name]
```

---

### Problem: Seed script runs but no data

**Symptoms:**
```
Seeding complete
# But SELECT COUNT(*) returns 0
```

**Solutions:**

1. **Check SQL syntax in seed_data.sql:**
```sql
-- Use INSERT OR IGNORE for SQLite
INSERT OR IGNORE INTO ...

-- Use INSERT ... ON CONFLICT for PostgreSQL
INSERT INTO ... ON CONFLICT ...

-- Use INSERT IGNORE for MySQL
INSERT IGNORE INTO ...
```

2. **Check database connection in seed script:**
```powershell
docker-compose logs service-pendapatan
# Look for connection errors
```

3. **Run seed manually and check output:**
```powershell
docker exec service-pendapatan python /app/seed.py
```

---

## ⚡ Performance Issues

### Problem: API response very slow

**Symptoms:**
- Aggregator takes > 5 seconds to respond
- Individual services slow

**Solutions:**

1. **Check resource usage:**
```powershell
docker stats
```

2. **Increase Docker memory:**
- Docker Desktop → Settings → Resources
- Increase Memory to 4GB+

3. **Check database indexes:**
```sql
-- NIK should be indexed
CREATE INDEX idx_nik ON penduduk(nik);
```

4. **Check if services are actually running:**
```powershell
docker-compose ps
```

---

### Problem: High CPU usage

**Symptoms:**
- Docker Desktop using 90%+ CPU
- Computer slow/laggy

**Solutions:**

1. **Check which container:**
```powershell
docker stats
```

2. **Restart problematic container:**
```powershell
docker-compose restart [service-name]
```

3. **Limit resources in docker-compose.yml:**
```yaml
service-name:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
```

---

### Problem: Disk space full

**Symptoms:**
```
Error: no space left on device
```

**Solutions:**

1. **Clean Docker:**
```powershell
docker system prune -a
```

2. **Remove unused volumes:**
```powershell
docker volume prune
```

3. **Check disk space:**
```powershell
docker system df
```

---

## 🆘 General Troubleshooting Steps

### When something doesn't work:

#### Step 1: Check Status
```powershell
docker-compose ps
```

#### Step 2: Check Logs
```powershell
docker-compose logs -f
```

#### Step 3: Restart Service
```powershell
docker-compose restart [service-name]
```

#### Step 4: Rebuild Service
```powershell
docker-compose up -d --build [service-name]
```

#### Step 5: Full Reset
```powershell
docker-compose down -v
docker-compose up -d --build
```

#### Step 6: Nuclear Option (Clean Everything)
```powershell
docker-compose down -v
docker system prune -a
docker volume prune
docker-compose up -d --build
```

---

## 📞 Still Having Issues?

### Check these:

1. **Docker Desktop is running**
2. **Enough disk space (> 5GB free)**
3. **Enough RAM (> 4GB available)**
4. **No other services using the same ports**
5. **Firewall not blocking Docker**
6. **Windows/PowerShell is up to date**

### Get more info:

```powershell
# Docker version
docker --version
docker-compose --version

# System info
docker info

# Container details
docker inspect [container-name]

# Network details
docker network inspect eai-implement-bus_soa-network
```

---

## 📚 Related Documentation

- [Panduan Penggunaan](./PANDUAN-PENGGUNAAN.md) - Cara penggunaan normal
- [Arsitektur](./ARSITEKTUR.md) - Memahami sistem
- [Implementasi](./IMPLEMENTASI.md) - Detail teknis
- [Commands](../COMMANDS.md) - Quick command reference

---

**💡 Tips:** Kebanyakan masalah bisa diselesaikan dengan restart atau rebuild container. Jangan ragu untuk reset dengan `docker-compose down -v && docker-compose up -d --build`.
