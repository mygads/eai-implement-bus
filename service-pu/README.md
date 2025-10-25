# Service Dinas Pekerjaan Umum (PU)

**Technology Stack**: Go (Golang) + MySQL

## Endpoints

### Get Proyek by NIK
```
GET /proyek?nik=:nik
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nik": "3201012345678901",
      "nama_proyek": "Pembangunan Jalan Tol Dalam Kota",
      "lokasi": "Jakarta Pusat",
      "status": "Berjalan",
      "anggaran": 500000000000,
      "tahun_anggaran": 2024,
      "keterangan": "Proyek infrastruktur jalan tol"
    }
  ],
  "count": 1
}
```

### Get Proyek by ID
```
GET /proyek/:id
```

### List All Proyek
```
GET /proyek
```

### Health Check
```
GET /health
```

## Dummy Data

5 data proyek infrastruktur dengan berbagai status (Berjalan, Selesai, Direncanakan).
