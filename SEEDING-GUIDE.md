# 🌱 Data Seeding Guide

## Overview

Semua data dummy telah dipisahkan ke file-file terpisah untuk memudahkan maintenance dan customization.

## 📁 File Seed Data

### 1. Service Kependudukan (PHP + SQLite)
```
service-kependudukan/
├── seed_data.sql         # SQL seed data
└── seed.sh               # Bash seed script
```

### 2. Service Pendapatan (Python + PostgreSQL)
```
service-pendapatan/
├── seed_data.sql         # SQL seed data
└── seed.py               # Python seed script
```

### 3. Service PU (Go + MySQL)
```
service-pu/
├── seed_data.sql         # SQL seed data
└── seed.sh               # Bash seed script
```

### 4. Service Kesehatan (Node.js + MongoDB)
```
service-kesehatan/
├── seed_data.js          # JavaScript seed data
└── seed.js               # Node.js seed script
```

---

## 🚀 Cara Menggunakan

### Option 1: Auto-Seed (Default)

Secara default, semua service akan **otomatis seed data** saat pertama kali start jika database kosong.

```powershell
docker-compose up -d --build
```

Data akan ter-seed otomatis!

### Option 2: Manual Seed - Semua Services

```powershell
# Seed semua services sekaligus
.\seed-all.ps1

# Atau dengan parameter explicit
.\seed-all.ps1 -Service all
```

### Option 3: Manual Seed - Per Service

```powershell
# Seed hanya service tertentu
.\seed-all.ps1 -Service kependudukan
.\seed-all.ps1 -Service pendapatan
.\seed-all.ps1 -Service pu
.\seed-all.ps1 -Service kesehatan
```

### Option 4: Seed Individual (Langsung ke Container)

**Service Kependudukan:**
```powershell
docker exec service-kependudukan /var/www/html/seed.sh
```

**Service Pendapatan:**
```powershell
docker exec service-pendapatan python /app/seed.py
```

**Service PU:**
```powershell
# Install mysql-client dulu (one-time)
docker exec service-pu sh -c "apk add --no-cache mysql-client"
# Run seed
docker exec service-pu /app/seed.sh
```

**Service Kesehatan:**
```powershell
docker exec service-kesehatan node /app/seed.js
```

---

## 🔧 Disable Auto-Seed

Jika ingin disable auto-seed saat startup, tambahkan environment variable:

**Edit `docker-compose.yml`:**

```yaml
service-kependudukan:
  environment:
    - AUTO_SEED=false

service-pendapatan:
  environment:
    - AUTO_SEED=false

service-pu:
  environment:
    - AUTO_SEED=false

service-kesehatan:
  environment:
    - AUTO_SEED=false
```

Lalu jalankan:
```powershell
docker-compose up -d --build
```

---

## 📝 Modifikasi Data Dummy

### 1. Edit File Seed

Edit file seed data sesuai service:
- `service-kependudukan/seed_data.sql`
- `service-pendapatan/seed_data.sql`
- `service-pu/seed_data.sql`
- `service-kesehatan/seed_data.js`

### 2. Rebuild Container (jika perlu)

```powershell
docker-compose up -d --build [service-name]
```

### 3. Clear Data & Re-seed

**Option A: Reset semua (termasuk volume):**
```powershell
docker-compose down -v
docker-compose up -d --build
```

**Option B: Manual delete & re-seed:**

**Kependudukan (SQLite):**
```powershell
docker exec service-kependudukan rm /var/www/html/data/kependudukan.db
docker restart service-kependudukan
```

**Pendapatan (PostgreSQL):**
```powershell
docker exec service-pendapatan sh -c "PGPASSWORD=postgres123 psql -h db-pendapatan -U postgres -d pendapatan_db -c 'TRUNCATE TABLE pajak CASCADE;'"
docker exec service-pendapatan python /app/seed.py
```

**PU (MySQL):**
```powershell
docker exec db-pu mysql -u root -pmysql123 -e "TRUNCATE TABLE proyek;" pu_db
docker exec service-pu sh -c "apk add mysql-client && /app/seed.sh"
```

**Kesehatan (MongoDB):**
```powershell
docker exec db-kesehatan mongosh --eval "db.getSiblingDB('kesehatan_db').rekammedis.deleteMany({})"
docker exec service-kesehatan node /app/seed.js
```

---

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

Atau gunakan master script:
```powershell
.\seed-all.ps1
# (akan show counts di akhir)
```

---

## 📋 Data Dummy Summary

### Penduduk (5 records)
- NIK 3201012345678901 - Budi Santoso
- NIK 3201012345678902 - Siti Aminah
- NIK 3201012345678903 - Ahmad Wijaya
- NIK 3201012345678904 - Dewi Lestari
- NIK 3201012345678905 - Rudi Hartono

### Pajak (5 records)
- Mapping dengan 5 NIK di atas
- NPWP format: 12.345.678.9-00X.000

### Proyek (5 records)
- 5 proyek infrastruktur
- Mapping dengan 5 NIK di atas

### Rekam Medis (6 records)
- Multiple records per NIK
- NIK 3201012345678901 punya 2 rekam medis
- NIK lain punya 1 rekam medis each

---

## 🎯 Best Practices

1. **Development:**
   - Keep auto-seed enabled untuk quick start
   - Edit seed files untuk customize data

2. **Testing:**
   - Use master script `seed-all.ps1`
   - Check counts setelah seed

3. **Production:**
   - Disable auto-seed dengan `AUTO_SEED=false`
   - Use manual seed scripts
   - Backup seed files

4. **Troubleshooting:**
   - Check container logs: `docker-compose logs [service]`
   - Verify database connection
   - Check file permissions in container

---

## ⚠️ Important Notes

1. **Idempotent Seeding:**
   - SQL files menggunakan `INSERT IGNORE` / `ON CONFLICT`
   - Script akan skip jika data sudah ada
   - Safe untuk run multiple times

2. **Dependencies:**
   - Wait for database to be ready (built-in retry logic)
   - Service PU needs `mysql-client` package (auto-install via script)

3. **File Locations dalam Container:**
   - Kependudukan: `/var/www/html/seed_data.sql`
   - Pendapatan: `/app/seed_data.sql`
   - PU: `/app/seed_data.sql`
   - Kesehatan: `/app/seed_data.js`

---

## 🆘 Troubleshooting

### Problem: Seed script not found
```powershell
# Rebuild container
docker-compose up -d --build [service-name]
```

### Problem: Permission denied
```powershell
# Check file in container
docker exec [service-name] ls -la /path/to/seed.*

# Fix permissions if needed (only for .sh files)
docker exec [service-name] chmod +x /path/to/seed.sh
```

### Problem: Database not ready
- Scripts have built-in retry logic (30 retries, 2s interval)
- Wait for containers to be fully up before seeding

### Problem: Data already exists
- Scripts will skip if data exists
- To force re-seed, delete data first (see "Clear Data & Re-seed" section)

---

**✅ Ready to seed! Good luck!**
