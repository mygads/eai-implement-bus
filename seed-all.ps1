# Master Seed Script - PowerShell
# Seed semua services atau per service

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "kependudukan", "pendapatan", "pu", "kesehatan")]
    [string]$Service = "all"
)

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🌱 SEED DATA - SOA SERVICES           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

function Seed-Kependudukan {
    Write-Host "📂 Seeding Service Kependudukan (PHP + SQLite)..." -ForegroundColor Yellow
    docker exec service-kependudukan /var/www/html/seed.sh
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kependudukan seeded successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to seed Kependudukan`n" -ForegroundColor Red
    }
}

function Seed-Pendapatan {
    Write-Host "📂 Seeding Service Pendapatan (Python + PostgreSQL)..." -ForegroundColor Yellow
    docker exec service-pendapatan python /app/seed.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pendapatan seeded successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to seed Pendapatan`n" -ForegroundColor Red
    }
}

function Seed-PU {
    Write-Host "📂 Seeding Service PU (Go + MySQL)..." -ForegroundColor Yellow
    # Install mysql client in container if needed
    docker exec service-pu sh -c "apk add --no-cache mysql-client 2>/dev/null || true"
    docker exec service-pu /app/seed.sh
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PU seeded successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to seed PU`n" -ForegroundColor Red
    }
}

function Seed-Kesehatan {
    Write-Host "📂 Seeding Service Kesehatan (Node.js + MongoDB)..." -ForegroundColor Yellow
    docker exec service-kesehatan node /app/seed.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kesehatan seeded successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to seed Kesehatan`n" -ForegroundColor Red
    }
}

# Check if containers are running
$containers = docker-compose ps -q
if (-not $containers) {
    Write-Host "❌ Error: No containers are running!" -ForegroundColor Red
    Write-Host "💡 Please start containers first: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Execute seeding based on parameter
switch ($Service) {
    "all" {
        Write-Host "🌱 Seeding ALL services...`n" -ForegroundColor Cyan
        Seed-Kependudukan
        Seed-Pendapatan
        Seed-PU
        Seed-Kesehatan
        Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║      ✅ ALL SERVICES SEEDED!                 ║" -ForegroundColor Green
        Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Green
    }
    "kependudukan" {
        Seed-Kependudukan
    }
    "pendapatan" {
        Seed-Pendapatan
    }
    "pu" {
        Seed-PU
    }
    "kesehatan" {
        Seed-Kesehatan
    }
}

Write-Host "📊 Checking data counts..." -ForegroundColor Cyan
Write-Host ""

# Check counts
Write-Host "Service Kependudukan: " -NoNewline
docker exec service-kependudukan sqlite3 /var/www/html/data/kependudukan.db "SELECT COUNT(*) FROM penduduk;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " records" -ForegroundColor Green
}

Write-Host "Service Pendapatan: " -NoNewline  
docker exec service-pendapatan sh -c "PGPASSWORD=postgres123 psql -h db-pendapatan -U postgres -d pendapatan_db -t -c 'SELECT COUNT(*) FROM pajak;'" 2>$null | ForEach-Object { $_.Trim() }
if ($LASTEXITCODE -eq 0) {
    Write-Host " records" -ForegroundColor Green
}

Write-Host "Service PU: " -NoNewline
docker exec db-pu mysql -u root -pmysql123 -N -e "SELECT COUNT(*) FROM proyek;" pu_db 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " records" -ForegroundColor Green
}

Write-Host "Service Kesehatan: " -NoNewline
docker exec db-kesehatan mongosh --quiet --eval "db.getSiblingDB('kesehatan_db').rekammedis.countDocuments()" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " records" -ForegroundColor Green
}

Write-Host "`n✅ Done!`n" -ForegroundColor Green
