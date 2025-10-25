# Service Dinas Kesehatan

**Technology Stack**: Node.js (Express) + MongoDB

## Endpoints

### Get Rekam Medis by NIK
```
GET /rekam-medis/:nik
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "nik": "3201012345678901",
      "nama_pasien": "Budi Santoso",
      "tanggal_kunjungan": "2024-03-20T00:00:00.000Z",
      "faskes": "RS Jakarta Pusat",
      "diagnosa": "Diabetes Mellitus",
      "tindakan": "Konsultasi dan pemeriksaan gula darah",
      "dokter": "Dr. Siti Nurhaliza",
      "biaya": 150000
    }
  ],
  "count": 2
}
```

### List All Rekam Medis
```
GET /rekam-medis
```

### Health Check
```
GET /health
```

## Dummy Data

6 data rekam medis dummy untuk berbagai pasien dengan diagnosa berbeda.
