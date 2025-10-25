# Service Dinas Kependudukan

**Technology Stack**: PHP 8.2 + SQLite

## Endpoints

### Get Penduduk by NIK
```
GET /penduduk/:nik
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "nik": "3201012345678901",
    "nama": "Budi Santoso",
    "alamat": "Jl. Merdeka No. 123, Jakarta",
    "tanggal_lahir": "1985-05-15",
    "jenis_kelamin": "L",
    "agama": "Islam",
    "status_perkawinan": "Menikah"
  }
}
```

### List All Penduduk
```
GET /penduduk
```

### Health Check
```
GET /health
```

## Running Locally

### With Docker
```bash
cd service-kependudukan
docker build -t service-kependudukan .
docker run -p 3001:80 service-kependudukan
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Get all penduduk
curl http://localhost:3001/penduduk

# Get specific penduduk
curl http://localhost:3001/penduduk/3201012345678901
```

## Dummy Data

5 data penduduk dummy tersedia dengan NIK:
- 3201012345678901 - Budi Santoso
- 3201012345678902 - Siti Aminah
- 3201012345678903 - Ahmad Wijaya
- 3201012345678904 - Dewi Lestari
- 3201012345678905 - Rudi Hartono
