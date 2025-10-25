# 📖 Panduan Penggunaan Lengkap

## Daftar Isi
- [Quick Start](#-quick-start-5-menit)
- [Menjalankan Project](#-menjalankan-project)
- [Testing](#-testing)
- [Menggunakan API](#-menggunakan-api)
- [Seeding Data](#-seeding-data)
- [Monitoring](#-monitoring)
- [Demo Scenario](#-demo-scenario)

---

## 🚀 Quick Start (5 Menit)

### 1. Start Semua Services

```powershell
# Masuk ke folder project
cd c:\Yoga\Programming\Kuliah\eai-implement-bus

# Build & start semua services
docker-compose up -d --build

# Tunggu initialization (30-60 detik)
Start-Sleep -Seconds 45

# Cek status (semua harus 'running')
docker-compose ps
```

### 2. Test API Aggregator

```powershell
# Set API Key
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

# Test MAIN FEATURE: Aggregated Profile
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers | ConvertTo-Json -Depth 5
```

### 3. Run Automated Tests

```powershell
.\test.ps1
```

✅ **Done! Project sudah jalan.**

---

## 📦 Menjalankan Project

### Prerequisites

**Sebelum mulai, pastikan sudah install:**
- ✅ Docker Desktop
- ✅ PowerShell (untuk testing)

### Build & Start

#### Option 1: Start Semua Services
```powershell
docker-compose up -d --build
```

#### Option 2: Start Specific Service
```powershell
docker-compose up -d --build service-kependudukan
docker-compose up -d --build service-pendapatan
docker-compose up -d --build service-pu
docker-compose up -d --build service-kesehatan
docker-compose up -d --build api-gateway
```

#### Option 3: Start dengan Logs
```powershell
# Lihat logs real-time
docker-compose up --build
```

### Stop Services

```powershell
# Stop semua services
docker-compose down

# Stop dan hapus volumes (reset data)
docker-compose down -v
```

### Restart Services

```powershell
# Restart semua
docker-compose restart

# Restart specific service
docker-compose restart api-gateway
docker-compose restart service-kependudukan
```

### Check Status

```powershell
# Lihat status containers
docker-compose ps

# Lihat logs
docker-compose logs -f

# Lihat logs specific service
docker-compose logs -f api-gateway
docker-compose logs -f service-kesehatan
```

---

## 🧪 Testing

### Automated Testing

**Jalankan script testing:**
```powershell
.\test.ps1
```

**Script akan test:**
- ✅ Gateway health check
- ✅ All services health check
- ✅ Direct service access (4 services)
- ✅ Gateway proxy endpoints
- ✅ **Main feature: Aggregated profile**
- ✅ Authentication testing

### Manual Testing

#### 1. Test Gateway Health (No Auth)

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/health"
```

**Curl:**
```bash
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T10:30:00.000Z"
}
```

#### 2. Test Services Health (With Auth)

**PowerShell:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers
```

**Expected Response:**
```json
{
  "gateway": "healthy",
  "kependudukan": "healthy",
  "pendapatan": "healthy",
  "pu": "healthy",
  "kesehatan": "healthy"
}
```

#### 3. Test Individual Services (Direct Access)

**Service Kependudukan:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/penduduk/3201012345678901"
```

**Service Pendapatan:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/pajak/nik/3201012345678901"
```

**Service PU:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/proyek?nik=3201012345678901"
```

**Service Kesehatan:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/rekam-medis/3201012345678901"
```

#### 4. Test via Gateway (With Auth)

**PowerShell:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

# Test proxy to Kependudukan
Invoke-RestMethod -Uri "http://localhost:8080/api/penduduk/3201012345678901" -Headers $headers

# Test proxy to Pendapatan
Invoke-RestMethod -Uri "http://localhost:8080/api/pajak/12.345.678.9-001.000" -Headers $headers

# Test proxy to PU
Invoke-RestMethod -Uri "http://localhost:8080/api/proyek?nik=3201012345678901" -Headers $headers

# Test proxy to Kesehatan
Invoke-RestMethod -Uri "http://localhost:8080/api/rekam-medis/3201012345678901" -Headers $headers
```

#### 5. Test Main Feature: Aggregated Profile ⭐

**PowerShell:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers | ConvertTo-Json -Depth 5
```

**Curl:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/warga/3201012345678901/profil
```

**Expected Response:**
```json
{
  "success": true,
  "nik": "3201012345678901",
  "timestamp": "2025-10-25T10:30:00.000Z",
  "data": {
    "penduduk": {
      "nik": "3201012345678901",
      "nama": "Budi Santoso",
      "alamat": "Jl. Merdeka No. 123, Jakarta",
      "tanggal_lahir": "1985-05-15"
    },
    "kesehatan": [
      {
        "tanggal_kunjungan": "2024-03-20",
        "diagnosa": "Diabetes Mellitus",
        "faskes": "RS Jakarta Pusat",
        "biaya": 500000
      }
    ],
    "infrastruktur": [
      {
        "nama_proyek": "Pembangunan Jalan Tol Dalam Kota",
        "status": "Berjalan",
        "anggaran": 500000000000
      }
    ],
    "pajak": [
      {
        "npwp": "12.345.678.9-001.000",
        "status": "Lunas",
        "jumlah_terutang": 5000000,
        "tahun": 2024
      }
    ]
  }
}
```

---

## 🔑 Menggunakan API

### Authentication

Semua endpoint API Gateway (kecuali `/health`) memerlukan **API Key**.

**Valid API Keys:**
- `demo-api-key-12345`
- `test-key-67890`
- `admin-key-abcde`

**Cara menggunakan:**

**PowerShell:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/..." -Headers $headers
```

**Curl:**
```bash
curl -H "X-API-Key: demo-api-key-12345" http://localhost:8080/api/...
```

**JavaScript/Fetch:**
```javascript
fetch('http://localhost:8080/api/...', {
  headers: {
    'X-API-Key': 'demo-api-key-12345'
  }
})
```

### Endpoints

#### API Gateway (Port 8080)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ No | Gateway health check |
| GET | `/services/health` | ✅ Yes | All services status |
| GET | `/api/warga/:nik/profil` | ✅ Yes | **Aggregated profile** ⭐ |
| GET | `/api/penduduk/:nik` | ✅ Yes | Proxy to Kependudukan |
| GET | `/api/pajak/:npwp` | ✅ Yes | Proxy to Pendapatan |
| GET | `/api/proyek?nik=:nik` | ✅ Yes | Proxy to PU |
| GET | `/api/rekam-medis/:nik` | ✅ Yes | Proxy to Kesehatan |

#### Direct Service Access

**Service Kependudukan (Port 3001):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/penduduk/:nik` | Get penduduk by NIK |
| GET | `/penduduk` | Get all penduduk |
| GET | `/health` | Health check |

**Service Pendapatan (Port 3002):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pajak/:npwp` | Get pajak by NPWP |
| GET | `/pajak/nik/:nik` | Get pajak by NIK |
| GET | `/pajak` | Get all pajak |
| GET | `/health` | Health check |

**Service PU (Port 3003):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/proyek?nik=:nik` | Get proyek by NIK |
| GET | `/proyek/:id` | Get proyek by ID |
| GET | `/proyek` | Get all proyek |
| GET | `/health` | Health check |

**Service Kesehatan (Port 3004):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rekam-medis/:nik` | Get rekam medis by NIK |
| GET | `/rekam-medis` | Get all rekam medis |
| GET | `/health` | Health check |

### Test Data (NIK)

| NIK | Nama | Kependudukan | Pajak | PU | Kesehatan |
|-----|------|--------------|-------|-----|-----------|
| 3201012345678901 | Budi Santoso | ✅ | ✅ | ✅ | ✅ |
| 3201012345678902 | Siti Aminah | ✅ | ✅ | ✅ | ✅ |
| 3201012345678903 | Ahmad Wijaya | ✅ | ✅ | ✅ | ✅ |
| 3201012345678904 | Dewi Lestari | ✅ | ✅ | ✅ | ✅ |
| 3201012345678905 | Rudi Hartono | ✅ | ✅ | ✅ | ✅ |

**Rekomendasi:** Gunakan NIK **3201012345678901** untuk testing karena memiliki data lengkap di semua service.

---

## 🌱 Seeding Data

### Auto-Seed (Default)

Secara default, semua service akan **otomatis seed data** saat pertama kali start jika database kosong.

```powershell
docker-compose up -d --build
# Data otomatis ter-seed!
```

### Manual Seed - Semua Services

```powershell
.\seed-all.ps1
```

### Manual Seed - Per Service

```powershell
.\seed-all.ps1 -Service kependudukan
.\seed-all.ps1 -Service pendapatan
.\seed-all.ps1 -Service pu
.\seed-all.ps1 -Service kesehatan
```

### Manual Seed - Direct ke Container

**Kependudukan:**
```powershell
docker exec service-kependudukan /var/www/html/seed.sh
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

### Disable Auto-Seed

Edit `docker-compose.yml`:
```yaml
service-kependudukan:
  environment:
    - AUTO_SEED=false
```

📚 **Panduan lengkap:** Lihat [SEEDING-GUIDE.md](../SEEDING-GUIDE.md)

---

## 📊 Monitoring

### Check Container Status

```powershell
docker-compose ps
```

**Expected output:**
```
NAME                      STATUS    PORTS
api-gateway               running   0.0.0.0:8080->3000/tcp
service-kependudukan      running   0.0.0.0:3001->80/tcp
service-pendapatan        running   0.0.0.0:3002->5000/tcp
service-pu                running   0.0.0.0:3003->8080/tcp
service-kesehatan         running   0.0.0.0:3004->3000/tcp
db-pendapatan             running   5432/tcp
db-pu                     running   3306/tcp
db-kesehatan              running   27017/tcp
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f service-kesehatan

# Last 100 lines
docker-compose logs --tail=100 service-pendapatan
```

### Check Data Count

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

### Access Database (Debugging)

**PostgreSQL:**
```powershell
docker exec -it db-pendapatan psql -U postgres -d pendapatan_db
```

**MySQL:**
```powershell
docker exec -it db-pu mysql -u root -pmysql123 pu_db
```

**MongoDB:**
```powershell
docker exec -it db-kesehatan mongosh kesehatan_db
```

**SQLite:**
```powershell
docker exec -it service-kependudukan sqlite3 /var/www/html/data/kependudukan.db
```

---

## 🎬 Demo Scenario

### Scenario: Tampilkan Profil Lengkap Warga

**Objective:** Menampilkan profil lengkap seorang warga yang data-nya tersebar di 4 dinas berbeda.

**Steps:**

#### 1. Persiapan
```powershell
# Start semua services
docker-compose up -d --build

# Wait for initialization
Start-Sleep -Seconds 45

# Verify all running
docker-compose ps
```

#### 2. Penjelasan Arsitektur
- Tunjukkan 4 service dengan teknologi berbeda
- Jelaskan API Gateway sebagai single entry point
- Highlight main feature: API Aggregation

#### 3. Demo Individual Services

**Show direct access to each service:**
```powershell
# Service 1: Kependudukan (PHP)
Invoke-RestMethod -Uri "http://localhost:3001/penduduk/3201012345678901"

# Service 2: Pendapatan (Python)
Invoke-RestMethod -Uri "http://localhost:3002/pajak/nik/3201012345678901"

# Service 3: PU (Go)
Invoke-RestMethod -Uri "http://localhost:3003/proyek?nik=3201012345678901"

# Service 4: Kesehatan (Node.js)
Invoke-RestMethod -Uri "http://localhost:3004/rekam-medis/3201012345678901"
```

**Jelaskan:** Tanpa SOA, client harus request 4x ke 4 endpoint berbeda.

#### 4. Demo API Aggregation ⭐

**Main Feature - 1 request dapat semua data:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers
$response | ConvertTo-Json -Depth 5
```

**Jelaskan:**
- Client cuma perlu 1 request
- Gateway melakukan 4 parallel calls
- Response teragregasi dalam 1 JSON
- Faster & better UX!

#### 5. Demo Authentication

**Without API Key (Fail):**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil"
# Expected: 401 Unauthorized
```

**With Valid API Key (Success):**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers
# Expected: 200 OK with data
```

#### 6. Demo Fault Tolerance

**Stop 1 service:**
```powershell
docker-compose stop service-pu
```

**Test aggregator:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers
```

**Jelaskan:** 
- Service PU down
- Tapi response tetap dikirim dengan partial data
- Service lain tetap berfungsi normal
- System tetap usable!

#### 7. Monitoring

**Check all services health:**
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers
```

---

## ✅ Checklist Demo

Sebelum demo, pastikan:

- [ ] Docker Desktop running
- [ ] All 9 containers running (`docker-compose ps`)
- [ ] Data seeded (cek dengan `.\seed-all.ps1` atau otomatis)
- [ ] Gateway health OK
- [ ] Services health OK
- [ ] Aggregator working dengan NIK 3201012345678901
- [ ] Siapkan presentasi arsitektur
- [ ] Siapkan penjelasan konsep SOA
- [ ] Test di browser/Postman sebagai backup

---

## 🎓 Tips Penggunaan

### Development
- Gunakan logs untuk debugging: `docker-compose logs -f`
- Restart service jika ada perubahan code: `docker-compose restart [service]`
- Rebuild jika ubah Dockerfile: `docker-compose up -d --build [service]`

### Testing
- Gunakan NIK 3201012345678901 (data lengkap)
- Test individual service dulu sebelum test aggregator
- Verify health checks sebelum test

### Presentation
- Focus ke main feature: API Aggregation
- Jelaskan benefit: 1 request vs 4 requests
- Show code dari berbagai bahasa (proof heterogeneous)
- Demo fault tolerance (impressive!)

---

📚 **Dokumentasi Lainnya:**
- [Arsitektur Sistem](./ARSITEKTUR.md)
- [Konsep SOA](./KONSEP-SOA.md)
- [Detail Implementasi](./IMPLEMENTASI.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Commands Reference](../COMMANDS.md)
- [Seeding Guide](../SEEDING-GUIDE.md)

---

**🎊 Selamat menggunakan! Good luck dengan demo!**
