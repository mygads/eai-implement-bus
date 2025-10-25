# 📡 API Endpoints Documentation

## 📋 Daftar Isi
- [Autentikasi](#autentikasi)
- [API Gateway](#api-gateway)
- [Service Kependudukan](#service-kependudukan)
- [Service Pendapatan](#service-pendapatan)
- [Service Pekerjaan Umum](#service-pekerjaan-umum)
- [Service Kesehatan](#service-kesehatan)
- [Error Codes](#error-codes)

---

## 🔐 Autentikasi

Semua request ke API Gateway harus menyertakan header `X-API-Key`:

```bash
# Bash/cURL
curl -H "X-API-Key: demo-api-key-12345" http://localhost:8080/api/health

# PowerShell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Headers $headers
```

**API Key Valid:**
- `demo-api-key-12345`
- `test-key-67890`
- `admin-key-11111`

**Response jika tidak ada API Key:**
```json
{
  "error": "Unauthorized",
  "message": "API key is required"
}
```

---

## 🌐 API Gateway
**Base URL:** `http://localhost:8080`

### Health Check
```http
GET /api/health
```
**Headers:** `X-API-Key: demo-api-key-12345`

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "kependudukan": "http://service-kependudukan",
    "pendapatan": "http://service-pendapatan:5000",
    "pu": "http://service-pu:3000",
    "kesehatan": "http://service-kesehatan:4000"
  }
}
```

---

### 🎯 **Main Feature: Aggregated Profile**
Mendapatkan profil lengkap warga dari semua service (Kependudukan, Kesehatan, Infrastruktur, Pajak).

```http
GET /api/warga/{nik}/profil
```

**Headers:** `X-API-Key: demo-api-key-12345`

**Parameters:**
- `nik` (string, required): NIK warga (16 digit)

**Example Request:**
```bash
# cURL
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/warga/3201012345678901/profil

# PowerShell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers
```

**Response:**
```json
{
  "nik": "3201012345678901",
  "data": {
    "penduduk": {
      "nik": "3201012345678901",
      "nama": "Budi Santoso",
      "tanggal_lahir": "1985-05-15",
      "alamat": "Jl. Merdeka No. 123, Jakarta",
      "status_perkawinan": "Kawin"
    },
    "kesehatan": [
      {
        "id": 1,
        "nik": "3201012345678901",
        "tanggal_kunjungan": "2024-01-15",
        "diagnosa": "Demam",
        "rumah_sakit": "RS Harapan Kita"
      },
      {
        "id": 2,
        "nik": "3201012345678901",
        "tanggal_kunjungan": "2024-02-20",
        "diagnosa": "Check-up Rutin",
        "rumah_sakit": "Puskesmas Cempaka"
      }
    ],
    "infrastruktur": [
      {
        "id": 1,
        "nama_proyek": "Pembangunan Jalan Tol",
        "lokasi": "Jakarta-Bandung",
        "anggaran": 5000000000,
        "status": "ongoing",
        "tanggal_mulai": "2024-01-01T00:00:00Z",
        "tanggal_selesai": "2025-12-31T00:00:00Z"
      }
      // ... 19 more projects
    ],
    "pajak": [
      {
        "id": 1,
        "nik": "3201012345678901",
        "jenis_pajak": "PBB",
        "jumlah": 1500000,
        "tahun": 2024,
        "status": "Lunas"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Proxy Endpoints

#### 1. Kependudukan Proxy
```http
GET /api/kependudukan/penduduk
GET /api/kependudukan/penduduk/{nik}
POST /api/kependudukan/penduduk
PUT /api/kependudukan/penduduk/{nik}
DELETE /api/kependudukan/penduduk/{nik}
```

**Example:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/kependudukan/penduduk
```

#### 2. Pendapatan Proxy
```http
GET /api/pendapatan/pajak
GET /api/pendapatan/pajak/{id}
POST /api/pendapatan/pajak
PUT /api/pendapatan/pajak/{id}
DELETE /api/pendapatan/pajak/{id}
```

**Example:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/pendapatan/pajak
```

#### 3. Pekerjaan Umum Proxy
```http
GET /api/pu/proyek
GET /api/pu/proyek/{id}
POST /api/pu/proyek
PUT /api/pu/proyek/{id}
DELETE /api/pu/proyek/{id}
```

**Example:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/pu/proyek
```

#### 4. Kesehatan Proxy
```http
GET /api/kesehatan/rekam-medis
GET /api/kesehatan/rekam-medis/{id}
POST /api/kesehatan/rekam-medis
PUT /api/kesehatan/rekam-medis/{id}
DELETE /api/kesehatan/rekam-medis/{id}
```

**Example:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/kesehatan/rekam-medis
```

---

## 👥 Service Kependudukan
**Base URL:** `http://localhost:8001`  
**Tech Stack:** PHP 8.2 + SQLite  
**Database:** `/app/kependudukan.db`

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "kependudukan",
  "database": "connected"
}
```

### Get All Penduduk
```http
GET /penduduk
```
**Response:**
```json
[
  {
    "nik": "3201012345678901",
    "nama": "Budi Santoso",
    "tanggal_lahir": "1985-05-15",
    "alamat": "Jl. Merdeka No. 123, Jakarta",
    "status_perkawinan": "Kawin"
  }
  // ... more records
]
```

### Get Penduduk by NIK
```http
GET /penduduk/{nik}
```
**Example:**
```bash
curl http://localhost:8001/penduduk/3201012345678901
```

### Create Penduduk
```http
POST /penduduk
Content-Type: application/json
```
**Request Body:**
```json
{
  "nik": "3201019999999999",
  "nama": "Test User",
  "tanggal_lahir": "1990-01-01",
  "alamat": "Jl. Test No. 1",
  "status_perkawinan": "Belum Kawin"
}
```

### Update Penduduk
```http
PUT /penduduk/{nik}
Content-Type: application/json
```

### Delete Penduduk
```http
DELETE /penduduk/{nik}
```

---

## 💰 Service Pendapatan
**Base URL:** `http://localhost:8002`  
**Tech Stack:** Python 3.11 + Flask + PostgreSQL  
**Database:** `pajak_db` on PostgreSQL

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "pendapatan"
}
```

### Get All Pajak
```http
GET /pajak
```
**Response:**
```json
[
  {
    "id": 1,
    "nik": "3201012345678901",
    "jenis_pajak": "PBB",
    "jumlah": 1500000,
    "tahun": 2024,
    "status": "Lunas"
  }
  // ... more records
]
```

### Get Pajak by ID
```http
GET /pajak/{id}
```

### Get Pajak by NIK
```http
GET /pajak/nik/{nik}
```
**Example:**
```bash
curl http://localhost:8002/pajak/nik/3201012345678901
```

### Create Pajak
```http
POST /pajak
Content-Type: application/json
```
**Request Body:**
```json
{
  "nik": "3201012345678901",
  "jenis_pajak": "PPh",
  "jumlah": 2000000,
  "tahun": 2024,
  "status": "Belum Lunas"
}
```

### Update Pajak
```http
PUT /pajak/{id}
Content-Type: application/json
```

### Delete Pajak
```http
DELETE /pajak/{id}
```

---

## 🏗️ Service Pekerjaan Umum
**Base URL:** `http://localhost:8003`  
**Tech Stack:** Go 1.21 + MySQL  
**Database:** `pu_db` on MySQL 8.0

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "pekerjaan-umum"
}
```

### Get All Proyek
```http
GET /proyek
```
**Response:**
```json
[
  {
    "id": 1,
    "nama_proyek": "Pembangunan Jalan Tol",
    "lokasi": "Jakarta-Bandung",
    "anggaran": 5000000000,
    "status": "ongoing",
    "tanggal_mulai": "2024-01-01T00:00:00Z",
    "tanggal_selesai": "2025-12-31T00:00:00Z"
  }
  // ... more records
]
```

### Get Proyek by ID
```http
GET /proyek/{id}
```

### Create Proyek
```http
POST /proyek
Content-Type: application/json
```
**Request Body:**
```json
{
  "nama_proyek": "Renovasi Gedung",
  "lokasi": "Jakarta Pusat",
  "anggaran": 1000000000,
  "status": "planned",
  "tanggal_mulai": "2024-06-01T00:00:00Z",
  "tanggal_selesai": "2024-12-31T00:00:00Z"
}
```

### Update Proyek
```http
PUT /proyek/{id}
Content-Type: application/json
```

### Delete Proyek
```http
DELETE /proyek/{id}
```

---

## 🏥 Service Kesehatan
**Base URL:** `http://localhost:8004`  
**Tech Stack:** Node.js 20 + Fastify + MongoDB  
**Database:** `kesehatan_db` on MongoDB 7.0

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "kesehatan"
}
```

### Get All Rekam Medis
```http
GET /rekam-medis
```
**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nik": "3201012345678901",
    "tanggal_kunjungan": "2024-01-15",
    "diagnosa": "Demam",
    "rumah_sakit": "RS Harapan Kita",
    "dokter": "Dr. Ahmad"
  }
  // ... more records
]
```

### Get Rekam Medis by ID
```http
GET /rekam-medis/{id}
```

### Get Rekam Medis by NIK
```http
GET /rekam-medis/nik/{nik}
```
**Example:**
```bash
curl http://localhost:8004/rekam-medis/nik/3201012345678901
```

### Create Rekam Medis
```http
POST /rekam-medis
Content-Type: application/json
```
**Request Body:**
```json
{
  "nik": "3201012345678901",
  "tanggal_kunjungan": "2024-03-15",
  "diagnosa": "Flu",
  "rumah_sakit": "RS Siloam",
  "dokter": "Dr. Budi"
}
```

### Update Rekam Medis
```http
PUT /rekam-medis/{id}
Content-Type: application/json
```

### Delete Rekam Medis
```http
DELETE /rekam-medis/{id}
```

---

## ❌ Error Codes

### Gateway Errors

| Code | Message | Deskripsi |
|------|---------|-----------|
| 401 | Unauthorized | API key tidak valid atau tidak ada |
| 404 | Not Found | Endpoint tidak ditemukan |
| 500 | Internal Server Error | Error pada gateway |
| 502 | Bad Gateway | Service backend tidak merespon |
| 503 | Service Unavailable | Service sedang down |

**Example Error Response:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

### Service Errors

| Code | Message | Deskripsi |
|------|---------|-----------|
| 400 | Bad Request | Request tidak valid |
| 404 | Not Found | Data tidak ditemukan |
| 409 | Conflict | Data sudah ada (duplicate) |
| 500 | Internal Server Error | Error pada service |

**Example Error Response:**
```json
{
  "error": "Data not found",
  "message": "NIK not found in database"
}
```

---

## 📊 Quick Reference

### Port Mapping
| Service | Port | Protocol |
|---------|------|----------|
| API Gateway | 8080 | HTTP |
| Kependudukan | 8001 | HTTP |
| Pendapatan | 8002 | HTTP |
| Pekerjaan Umum | 8003 | HTTP |
| Kesehatan | 8004 | HTTP |

### Database Ports
| Database | Port | Type |
|----------|------|------|
| PostgreSQL | 5432 | SQL |
| MySQL | 3306 | SQL |
| MongoDB | 27017 | NoSQL |

### Sample Data Count
- **Kependudukan:** 15 penduduk
- **Pendapatan:** 15 pajak
- **Pekerjaan Umum:** 20 proyek
- **Kesehatan:** 25 rekam medis

---

## 🧪 Testing Examples

### Test Aggregation
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers
$response | ConvertTo-Json -Depth 10
```

### Test All Services Health
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

Write-Host "Gateway:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Headers $headers

Write-Host "`nKependudukan:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8001/health"

Write-Host "`nPendapatan:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8002/health"

Write-Host "`nPU:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8003/health"

Write-Host "`nKesehatan:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8004/health"
```

### Test CRUD Operations
```powershell
$headers = @{ "X-API-Key" = "demo-api-key-12345" }
$body = @{
    nik = "3201019999999999"
    nama = "Test User"
    tanggal_lahir = "1990-01-01"
    alamat = "Jl. Test No. 1"
    status_perkawinan = "Belum Kawin"
} | ConvertTo-Json

# CREATE
Invoke-RestMethod -Uri "http://localhost:8080/api/kependudukan/penduduk" `
  -Method POST -Headers $headers -Body $body -ContentType "application/json"

# READ
Invoke-RestMethod -Uri "http://localhost:8080/api/kependudukan/penduduk/3201019999999999" `
  -Headers $headers

# DELETE
Invoke-RestMethod -Uri "http://localhost:8080/api/kependudukan/penduduk/3201019999999999" `
  -Method DELETE -Headers $headers
```

---

## 📝 Notes

1. **Autentikasi:** Semua request ke Gateway (`http://localhost:8080`) HARUS menyertakan header `X-API-Key`
2. **Direct Access:** Service bisa diakses langsung tanpa API key untuk testing
3. **Auto-Seed:** Data sample otomatis ter-seed saat pertama kali container dijalankan
4. **CORS:** Gateway sudah dikonfigurasi untuk menerima request dari semua origin
5. **Content-Type:** Untuk POST/PUT request, gunakan `Content-Type: application/json`

---

**Dibuat:** 2024  
**Versi:** 1.0  
**Tech Stack:** PHP, Python, Go, Node.js, SQLite, PostgreSQL, MySQL, MongoDB
