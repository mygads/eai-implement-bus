# API Gateway / Enterprise Service Bus (ESB)

**Technology Stack**: Node.js (Fastify)

## Features

✅ **API Gateway Pattern**: Single entry point untuk semua services
✅ **Authentication**: API Key validation
✅ **API Aggregator**: Menggabungkan data dari multiple services
✅ **Service Proxy**: Forward requests ke individual services
✅ **Health Check**: Monitor status semua services
✅ **CORS**: Cross-Origin Resource Sharing enabled

## Authentication

Semua endpoint (kecuali `/health`) memerlukan API Key di header:

```
X-API-Key: demo-api-key-12345
```

### Valid API Keys:
- `demo-api-key-12345`
- `test-key-67890`
- `admin-key-abcde`

## Main Endpoints

### 1. Aggregated Profile (Main Feature) ⭐
```
GET /api/warga/:nik/profil
```

Menggabungkan data dari 4 service sekaligus:
- Data penduduk (Dinas Kependudukan)
- Rekam medis (Dinas Kesehatan)
- Proyek infrastruktur (Dinas PU)
- Data pajak (Dinas Pendapatan)

**Example Request:**
```bash
curl -H "X-API-Key: demo-api-key-12345" \
  http://localhost:8080/api/warga/3201012345678901/profil
```

**Example Response:**
```json
{
  "success": true,
  "nik": "3201012345678901",
  "timestamp": "2024-10-25T10:30:00.000Z",
  "data": {
    "penduduk": {
      "nik": "3201012345678901",
      "nama": "Budi Santoso",
      "alamat": "Jl. Merdeka No. 123, Jakarta",
      "tanggal_lahir": "1985-05-15",
      "jenis_kelamin": "L",
      "agama": "Islam",
      "status_perkawinan": "Menikah"
    },
    "kesehatan": [
      {
        "nik": "3201012345678901",
        "tanggal_kunjungan": "2024-03-20T00:00:00.000Z",
        "faskes": "RS Jakarta Pusat",
        "diagnosa": "Diabetes Mellitus",
        "dokter": "Dr. Siti Nurhaliza",
        "biaya": 150000
      }
    ],
    "infrastruktur": [
      {
        "id": 1,
        "nik": "3201012345678901",
        "nama_proyek": "Pembangunan Jalan Tol Dalam Kota",
        "status": "Berjalan",
        "anggaran": 500000000000
      }
    ],
    "pajak": [
      {
        "npwp": "12.345.678.9-001.000",
        "nik": "3201012345678901",
        "status": "Lunas",
        "jumlah_terutang": 5000000
      }
    ]
  }
}
```

### 2. Service Health Check
```
GET /services/health
```

### 3. Individual Service Proxies

```
GET /api/penduduk/:nik
GET /api/pajak/:npwp
GET /api/proyek?nik=:nik
GET /api/rekam-medis/:nik
```

## Testing

```powershell
# Set API key (PowerShell)
$headers = @{ "X-API-Key" = "demo-api-key-12345" }

# Get aggregated profile
Invoke-RestMethod -Uri "http://localhost:8080/api/warga/3201012345678901/profil" -Headers $headers

# Check services health
Invoke-RestMethod -Uri "http://localhost:8080/services/health" -Headers $headers
```

## Architecture

```
Client
  ↓
API Gateway (Port 8080)
  ├─→ Service Kependudukan (PHP + SQLite) - Port 3001
  ├─→ Service Pendapatan (Python + PostgreSQL) - Port 3002
  ├─→ Service PU (Go + MySQL) - Port 3003
  └─→ Service Kesehatan (Node.js + MongoDB) - Port 3004
```
