# Service Dinas Pendapatan

**Technology Stack**: Python (Flask) + PostgreSQL

## Endpoints

### Get Pajak by NPWP
```
GET /pajak/:npwp
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "npwp": "12.345.678.9-001.000",
    "nik": "3201012345678901",
    "nama_wajib_pajak": "Budi Santoso",
    "status": "Lunas",
    "jumlah_terutang": 5000000.00,
    "tahun_pajak": 2024,
    "jenis_pajak": "PBB"
  }
}
```

### Get Pajak by NIK
```
GET /pajak/nik/:nik
```

### List All Pajak
```
GET /pajak
```

### Health Check
```
GET /health
```

## Dummy Data

5 data pajak dummy dengan NPWP dan NIK yang sesuai dengan data penduduk.
