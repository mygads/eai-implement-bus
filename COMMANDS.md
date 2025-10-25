# Quick Commands

## 🚀 Start All Services
```powershell
docker-compose up -d --build
# Data will be auto-seeded on first run
```

## 🛑 Stop All Services
```powershell
docker-compose down
```

## 🌱 Seed Data

### Seed All Services
```powershell
.\seed-all.ps1
```

### Seed Specific Service
```powershell
.\seed-all.ps1 -Service kependudukan
.\seed-all.ps1 -Service pendapatan
.\seed-all.ps1 -Service pu
.\seed-all.ps1 -Service kesehatan
```

### Seed Individual (Direct to Container)

**Kependudukan:**
```powershell
docker exec service-kependudukan /app/seed.sh
```

**Pendapatan:**
```powershell
docker exec service-pendapatan python /app/seed.py
```

**PU:**
```powershell
docker exec service-pu sh -c "apk add --no-cache mysql-client && /app/seed.sh"
```

**Kesehatan:**
```powershell
docker exec service-kesehatan node /app/seed.js
```

## 📊 Check Data Count

```powershell
# Kependudukan
docker exec service-kependudukan sqlite3 /var/www/html/data/kependudukan.db "SELECT COUNT(*) FROM penduduk;"

# Pendapatan
docker exec service-pendapatan sh -c "PGPASSWORD=postgres123 psql -h db-pendapatan -U postgres -d pendapatan_db -t -c 'SELECT COUNT(*) FROM pajak;'"

# PU
docker exec db-pu mysql -u root -pmysql123 -N -e "SELECT COUNT(*) FROM proyek;" pu_db

# Kesehatan
docker exec db-kesehatan mongosh --quiet --eval "db.getSiblingDB('kesehatan_db').rekammedis.countDocuments()"
```

## 📋 View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f service-kependudukan
docker-compose logs -f service-pendapatan
docker-compose logs -f service-pu
docker-compose logs -f service-kesehatan
```

## 🔄 Restart Specific Service
```powershell
docker-compose restart api-gateway
```

## 🔨 Rebuild Specific Service
```powershell
docker-compose up -d --build service-kependudukan
```

## 🗑️ Remove All (including volumes)
```powershell
docker-compose down -v
```

## 🔄 Reset & Re-seed

### Full Reset (All Services)
```powershell
docker-compose down -v
docker-compose up -d --build
# Auto-seed will happen
```

### Reset Specific Database

**Kependudukan:**
```powershell
docker exec service-kependudukan rm /var/www/html/data/kependudukan.db
docker restart service-kependudukan
```

**Pendapatan:**
```powershell
docker exec service-pendapatan sh -c "PGPASSWORD=postgres123 psql -h db-pendapatan -U postgres -d pendapatan_db -c 'TRUNCATE TABLE pajak CASCADE;'"
docker exec service-pendapatan python /app/seed.py
```

**PU:**
```powershell
docker exec db-pu mysql -u root -pmysql123 -e "TRUNCATE TABLE proyek;" pu_db
docker exec service-pu /app/seed.sh
```

**Kesehatan:**
```powershell
docker exec db-kesehatan mongosh --eval "db.getSiblingDB('kesehatan_db').rekammedis.deleteMany({})"
docker exec service-kesehatan node /app/seed.js
```

## ✅ Check Status

## ✅ Check Status
```powershell
docker-compose ps
```

## 🧪 Quick Test (PowerShell)
```powershell
# Set API Key
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

# Test aggregated profile
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers | ConvertTo-Json -Depth 5

# Check services health
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers | ConvertTo-Json -Depth 3
```

## 🧪 Run Testing Script
```powershell
.\test.ps1
```

## 🗄️ Access Databases (for debugging)

### PostgreSQL
```powershell
docker exec -it db-pendapatan psql -U postgres -d pendapatan_db
```

### MySQL
```powershell
docker exec -it db-pu mysql -u root -pmysql123 pu_db
```

### MongoDB
```powershell
docker exec -it db-kesehatan mongosh kesehatan_db
```

### SQLite
```powershell
docker exec -it service-kependudukan sqlite3 /var/www/html/data/kependudukan.db
```

## 🌐 Port Mappings
- **3001** - Service Kependudukan (PHP)
- **3002** - Service Pendapatan (Python)
- **3003** - Service PU (Go)
- **3004** - Service Kesehatan (Node.js)
- **8080** - API Gateway

## 🔗 Test URLs

### Direct Service Access
- http://localhost:3001/penduduk/3201012345678901
- http://localhost:3002/pajak/nik/3201012345678901
- http://localhost:3003/proyek?nik=3201012345678901
- http://localhost:3004/rekam-medis/3201012345678901

### Via API Gateway (needs X-API-Key header)
- http://localhost:8080/api/warga/3201012345678901/profil
- http://localhost:8080/services/health

---

## 📚 More Documentation

- **[SEEDING-GUIDE.md](./SEEDING-GUIDE.md)** - Detailed seeding documentation
- **[README.md](./README.md)** - Main documentation
- **[QUICK-START.md](./QUICK-START.md)** - Visual quick start guide
