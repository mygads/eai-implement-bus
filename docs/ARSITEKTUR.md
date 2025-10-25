# 🏗️ Arsitektur Sistem

## Overview

Sistem ini mengimplementasikan **Service-Oriented Architecture (SOA)** dengan **API Gateway Pattern** untuk mengintegrasikan 4 dinas pemerintahan dengan teknologi heterogen.

---

## 📊 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                       CLIENT                            │
│           (Browser / Postman / PowerShell)              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP Request
                         │ Header: X-API-Key
                         ▼
         ┌───────────────────────────────┐
         │    🚪 API GATEWAY / ESB       │
         │     Node.js + Fastify         │
         │         Port: 8080            │
         │                               │
         │  Features:                    │
         │  ✓ Authentication (API Key)   │
         │  ✓ Routing                    │
         │  ✓ API Aggregation ⭐         │
         │  ✓ Health Check               │
         └───────────────┬───────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
│   SERVICE 1  │  │  SERVICE 2  │  │ SERVICE 3  │  │  SERVICE 4  │
├──────────────┤  ├─────────────┤  ├────────────┤  ├─────────────┤
│ 🏛️ DINAS     │  │ 💰 DINAS    │  │ 🏗️ DINAS   │  │ 🏥 DINAS    │
│ KEPENDUDUKAN │  │ PENDAPATAN  │  │     PU     │  │  KESEHATAN  │
├──────────────┤  ├─────────────┤  ├────────────┤  ├─────────────┤
│              │  │             │  │            │  │             │
│ PHP 8.2      │  │ Python 3.11 │  │  Go 1.21   │  │ Node.js 20  │
│ + Apache     │  │ + Flask     │  │ + Gorilla  │  │ + Express   │
│              │  │             │  │            │  │             │
│ Port: 3001   │  │ Port: 3002  │  │ Port: 3003 │  │ Port: 3004  │
└──────┬───────┘  └──────┬──────┘  └─────┬──────┘  └──────┬──────┘
       │                 │                │                │
       ▼                 ▼                ▼                ▼
┌──────────────┐  ┌─────────────┐  ┌────────────┐  ┌─────────────┐
│   SQLite     │  │ PostgreSQL  │  │   MySQL    │  │   MongoDB   │
│ (embedded)   │  │     16      │  │     8.0    │  │     7.0     │
└──────────────┘  └─────────────┘  └────────────┘  └─────────────┘
```

---

## 🔄 Data Flow: Aggregated Profile Request

### Flow Diagram

```
1. Client Request
   ├─ URL: GET /api/warga/3201012345678901/profil
   ├─ Header: X-API-Key: demo-api-key-12345
   └─ Target: API Gateway (Port 8080)

2. API Gateway Processing
   ├─ ✓ Validate API Key
   ├─ ✓ Extract NIK from URL
   └─ ✓ Parallel calls to 4 services:

3. Parallel Service Calls (Async)
   ├─ Call 1: GET http://service-kependudukan/penduduk/3201012345678901
   │   └─ Response: { nama, alamat, tanggal_lahir, ... }
   │
   ├─ Call 2: GET http://service-kesehatan:3000/rekam-medis/3201012345678901
   │   └─ Response: [{ tanggal_kunjungan, diagnosa, faskes, ... }]
   │
   ├─ Call 3: GET http://service-pu:8080/proyek?nik=3201012345678901
   │   └─ Response: [{ nama_proyek, status, anggaran, ... }]
   │
   └─ Call 4: GET http://service-pendapatan:5000/pajak/nik/3201012345678901
       └─ Response: [{ npwp, status, jumlah_terutang, ... }]

4. API Gateway Aggregation
   ├─ Merge all responses
   ├─ Handle missing data (null/empty array)
   └─ Format final JSON response

5. Client Response
   └─ Aggregated JSON with data from all 4 services
```

---

## 🏛️ Komponen Sistem

### 1. API Gateway / ESB

**Technology:** Node.js 20 + Fastify  
**Port:** 8080  
**Role:** Single entry point untuk semua services

**Responsibilities:**
- ✅ Authentication (API Key validation)
- ✅ Request routing ke service yang sesuai
- ✅ **API Aggregation** (Main Feature)
- ✅ Parallel processing untuk multiple service calls
- ✅ Error handling & fallback
- ✅ Health monitoring semua services
- ✅ CORS configuration

**Key Endpoints:**
- `GET /health` - Gateway health (no auth)
- `GET /services/health` - All services status (with auth)
- `GET /api/warga/:nik/profil` - **Aggregated profile** ⭐
- `GET /api/penduduk/:nik` - Proxy to Kependudukan
- `GET /api/pajak/:npwp` - Proxy to Pendapatan
- `GET /api/proyek?nik=:nik` - Proxy to PU
- `GET /api/rekam-medis/:nik` - Proxy to Kesehatan

---

### 2. Service Kependudukan

**Technology:** PHP 8.2 + Apache + SQLite  
**Port:** 3001  
**Database:** SQLite (embedded)

**Data Model:**
```sql
CREATE TABLE penduduk (
    nik TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    alamat TEXT,
    tanggal_lahir DATE,
    jenis_kelamin TEXT,
    pekerjaan TEXT
);
```

**Endpoints:**
- `GET /penduduk/:nik` - Get penduduk by NIK
- `GET /penduduk` - Get all penduduk
- `GET /health` - Health check

---

### 3. Service Pendapatan

**Technology:** Python 3.11 + Flask + PostgreSQL  
**Port:** 3002  
**Database:** PostgreSQL 16 (separate container: `db-pendapatan`)

**Data Model:**
```sql
CREATE TABLE pajak (
    id SERIAL PRIMARY KEY,
    nik VARCHAR(16),
    npwp VARCHAR(20) UNIQUE,
    status VARCHAR(20),
    jumlah_terutang DECIMAL(15,2),
    tahun INTEGER
);
```

**Endpoints:**
- `GET /pajak/:npwp` - Get pajak by NPWP
- `GET /pajak/nik/:nik` - Get pajak by NIK
- `GET /pajak` - Get all pajak
- `GET /health` - Health check

---

### 4. Service PU (Pekerjaan Umum)

**Technology:** Go 1.21 + Gorilla Mux + MySQL  
**Port:** 3003  
**Database:** MySQL 8.0 (separate container: `db-pu`)

**Data Model:**
```sql
CREATE TABLE proyek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(16),
    nama_proyek VARCHAR(255),
    status VARCHAR(50),
    anggaran DECIMAL(15,2),
    tanggal_mulai DATE,
    tanggal_selesai DATE
);
```

**Endpoints:**
- `GET /proyek?nik=:nik` - Get proyek by NIK
- `GET /proyek/:id` - Get proyek by ID
- `GET /proyek` - Get all proyek
- `GET /health` - Health check

---

### 5. Service Kesehatan

**Technology:** Node.js 20 + Express + MongoDB  
**Port:** 3004  
**Database:** MongoDB 7.0 (separate container: `db-kesehatan`)

**Data Model:**
```javascript
{
    nik: String,
    tanggal_kunjungan: Date,
    diagnosa: String,
    tindakan: String,
    faskes: String,
    biaya: Number
}
```

**Endpoints:**
- `GET /rekam-medis/:nik` - Get rekam medis by NIK
- `GET /rekam-medis` - Get all rekam medis
- `GET /health` - Health check

---

## 🗄️ Database Architecture

### Database per Service Pattern

Setiap service memiliki database sendiri untuk mencapai **loose coupling** dan **independence**.

| Service | Database | Type | Container |
|---------|----------|------|-----------|
| Kependudukan | SQLite | Embedded | service-kependudukan |
| Pendapatan | PostgreSQL 16 | Relational | db-pendapatan |
| PU | MySQL 8.0 | Relational | db-pu |
| Kesehatan | MongoDB 7.0 | Document | db-kesehatan |

**Benefits:**
- ✅ No shared database (decoupling)
- ✅ Each service can choose optimal DB
- ✅ Independent scaling
- ✅ No single point of failure

---

## 🐳 Docker Architecture

### Container Orchestration

**Total Containers:** 9

**Application Containers (5):**
1. `api-gateway` - Node.js Fastify
2. `service-kependudukan` - PHP + Apache
3. `service-pendapatan` - Python Flask
4. `service-pu` - Go application
5. `service-kesehatan` - Node.js Express

**Database Containers (4):**
1. `db-pendapatan` - PostgreSQL 16
2. `db-pu` - MySQL 8.0
3. `db-kesehatan` - MongoDB 7.0
4. *(SQLite embedded in service-kependudukan)*

### Network Configuration

**Network:** `soa-network` (Bridge driver)

**DNS Resolution:**
- Services communicate using container names
- Example: `http://service-kependudukan/penduduk/123`

### Volume Management

**Persistent Volumes:**
- `kependudukan-data` - SQLite database file
- `pendapatan-db-data` - PostgreSQL data
- `pu-db-data` - MySQL data
- `kesehatan-db-data` - MongoDB data

---

## 🔐 Security Architecture

### Authentication Flow

```
1. Client Request
   ├─ Include Header: X-API-Key: xxx
   └─ To: http://localhost:8080/api/*

2. API Gateway
   ├─ Validate API Key
   ├─ If valid: Continue
   └─ If invalid: Return 401/403

3. Service Call
   ├─ Gateway calls backend service
   └─ No auth needed (internal network)

4. Response
   └─ Return to client
```

**Valid API Keys:**
- `demo-api-key-12345`
- `test-key-67890`
- `admin-key-abcde`

**Endpoints Without Auth:**
- `GET /health` (Gateway health check only)

---

## 📈 Scalability Architecture

### Horizontal Scaling Strategy

Setiap service dapat di-scale independen:

```
# Scale Service Kesehatan to 3 instances
docker-compose up -d --scale service-kesehatan=3

# Gateway can load balance between instances
API Gateway
├─ service-kesehatan-1
├─ service-kesehatan-2
└─ service-kesehatan-3
```

### Load Balancing

Gateway dapat ditambahkan load balancer (future enhancement):
- Round-robin distribution
- Least connections
- Health-based routing

---

## 🔄 Communication Patterns

### 1. Request-Response (Synchronous)

Digunakan untuk semua service calls:
```
Client → Gateway → Service → Response
```

### 2. Parallel Aggregation

Digunakan untuk aggregated profile:
```
Gateway →┬→ Service 1 →┬
         ├→ Service 2 →├→ Aggregate → Response
         ├→ Service 3 →┤
         └→ Service 4 →┘
```

### 3. Fail-Safe Pattern

Jika 1 service gagal:
```
Service 1: ✅ OK → data included
Service 2: ❌ FAIL → empty array/null
Service 3: ✅ OK → data included
Service 4: ✅ OK → data included

Result: Partial data returned (better than total failure)
```

---

## 🏆 Design Patterns

### 1. API Gateway Pattern
- Single entry point
- Centralized authentication
- Request routing

### 2. Aggregator Pattern
- Combine multiple service responses
- Parallel processing
- Unified response format

### 3. Database per Service Pattern
- Independent databases
- No shared schema
- Loose coupling

### 4. Health Check Pattern
- Each service exposes `/health`
- Gateway monitors all services
- Easy troubleshooting

### 5. Circuit Breaker Pattern (Implemented)
- Timeout for service calls
- Fallback to empty data
- Prevent cascading failures

---

## 📊 Port Mapping

| Component | Internal Port | External Port | Protocol |
|-----------|--------------|---------------|----------|
| API Gateway | 3000 | 8080 | HTTP |
| Service Kependudukan | 80 | 3001 | HTTP |
| Service Pendapatan | 5000 | 3002 | HTTP |
| Service PU | 8080 | 3003 | HTTP |
| Service Kesehatan | 3000 | 3004 | HTTP |
| PostgreSQL | 5432 | - | TCP |
| MySQL | 3306 | - | TCP |
| MongoDB | 27017 | - | TCP |

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

**Gateway:**
```
GET http://localhost:8080/health
Response: { "status": "healthy", "timestamp": "..." }
```

**All Services:**
```
GET http://localhost:8080/services/health
Response: {
  "gateway": "healthy",
  "kependudukan": "healthy",
  "pendapatan": "healthy",
  "pu": "healthy",
  "kesehatan": "healthy"
}
```

### Monitoring Strategy

1. **Container Level:** `docker-compose ps`
2. **Application Level:** Health check endpoints
3. **Database Level:** Connection status in health checks
4. **Network Level:** Inter-container communication

---

## 🎯 Arsitektur Highlights

### Strengths
- ✅ **Heterogeneous Technology** - 4 bahasa, 4 database
- ✅ **Loose Coupling** - Services tidak saling depend
- ✅ **Independent Deployment** - Deploy per service
- ✅ **Fault Isolation** - 1 service down tidak ganggu lainnya
- ✅ **Technology Flexibility** - Bebas pilih tech stack per service
- ✅ **Scalability** - Scale per service sesuai kebutuhan
- ✅ **Maintainability** - Easy to update/replace services

### Trade-offs
- ⚠️ **Complexity** - Lebih complex dari monolith
- ⚠️ **Network Overhead** - Inter-service communication
- ⚠️ **Distributed Transactions** - Cross-service transaction challenging
- ⚠️ **Debugging** - Distributed system debugging harder

---

**Arsitektur ini mendemonstrasikan implementasi SOA yang solid dengan best practices modern untuk enterprise systems.**
