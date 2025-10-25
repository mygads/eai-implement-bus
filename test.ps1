# Testing Script untuk SOA Implementation
# PowerShell Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SOA IMPLEMENTATION - TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# API Key
$apiKey = "demo-api-key-12345"
$headers = @{ "X-API-Key" = $apiKey }

# Base URLs
$gatewayUrl = "http://localhost:8080"
$kependudukanUrl = "http://localhost:3001"
$pendapatanUrl = "http://localhost:3002"
$puUrl = "http://localhost:3003"
$kesehatanUrl = "http://localhost:3004"

Write-Host "Testing API Key: $apiKey" -ForegroundColor Yellow
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Green
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Headers $Headers -Method Get
        Write-Host "✓ SUCCESS" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        Write-Host "✗ FAILED: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# 1. Test API Gateway Health
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. API GATEWAY HEALTH CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Endpoint -Name "Gateway Health" -Url "$gatewayUrl/health"

# 2. Test Services Health
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "2. ALL SERVICES HEALTH CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Test-Endpoint -Name "Services Health" -Url "$gatewayUrl/services/health" -Headers $headers

# 3. Test Individual Services (Direct Access)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "3. INDIVIDUAL SERVICES (DIRECT)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Test-Endpoint -Name "Kependudukan - Budi Santoso" -Url "$kependudukanUrl/penduduk/3201012345678901"
Test-Endpoint -Name "Pendapatan - By NIK" -Url "$pendapatanUrl/pajak/nik/3201012345678901"
Test-Endpoint -Name "PU - Proyek by NIK" -Url "$puUrl/proyek?nik=3201012345678901"
Test-Endpoint -Name "Kesehatan - Rekam Medis" -Url "$kesehatanUrl/rekam-medis/3201012345678901"

# 4. Test API Gateway Proxies
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "4. API GATEWAY PROXIES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Test-Endpoint -Name "Gateway Proxy - Penduduk" -Url "$gatewayUrl/api/penduduk/3201012345678901" -Headers $headers
Test-Endpoint -Name "Gateway Proxy - Proyek" -Url "$gatewayUrl/api/proyek?nik=3201012345678901" -Headers $headers
Test-Endpoint -Name "Gateway Proxy - Rekam Medis" -Url "$gatewayUrl/api/rekam-medis/3201012345678901" -Headers $headers

# 5. MAIN TEST: Aggregated Profile
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "5. MAIN FEATURE: AGGREGATED PROFILE ⭐" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Testing NIK: 3201012345678901 (Budi Santoso)" -ForegroundColor Yellow
Test-Endpoint -Name "Aggregated Profile - Budi Santoso" -Url "$gatewayUrl/api/warga/3201012345678901/profil" -Headers $headers

Write-Host "Testing NIK: 3201012345678902 (Siti Aminah)" -ForegroundColor Yellow
Test-Endpoint -Name "Aggregated Profile - Siti Aminah" -Url "$gatewayUrl/api/warga/3201012345678902/profil" -Headers $headers

# 6. Test Authentication
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "6. AUTHENTICATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Testing WITHOUT API Key (should fail):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$gatewayUrl/api/warga/3201012345678901/profil" -Method Get
    Write-Host "✗ FAILED: Should require API Key" -ForegroundColor Red
} catch {
    Write-Host "✓ SUCCESS: Correctly rejected (401/403)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Testing WITH INVALID API Key (should fail):" -ForegroundColor Yellow
try {
    $invalidHeaders = @{ "X-API-Key" = "invalid-key-123" }
    $response = Invoke-RestMethod -Uri "$gatewayUrl/api/warga/3201012345678901/profil" -Headers $invalidHeaders -Method Get
    Write-Host "✗ FAILED: Should reject invalid key" -ForegroundColor Red
} catch {
    Write-Host "✓ SUCCESS: Correctly rejected invalid key (403)" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  TESTING COMPLETED!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
