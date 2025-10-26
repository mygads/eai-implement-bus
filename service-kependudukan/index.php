<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database setup
$dbFile = '/app/data/kependudukan.db';
$dbDir = dirname($dbFile);

if (!file_exists($dbDir)) {
    mkdir($dbDir, 0777, true);
}

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create table if not exists
    $db->exec("
        CREATE TABLE IF NOT EXISTS penduduk (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nik TEXT UNIQUE NOT NULL,
            nama TEXT NOT NULL,
            alamat TEXT NOT NULL,
            tanggal_lahir DATE NOT NULL,
            jenis_kelamin TEXT,
            agama TEXT,
            status_perkawinan TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Auto-seed data if empty (optional - can be disabled)
    $count = $db->query("SELECT COUNT(*) FROM penduduk")->fetchColumn();
    if ($count == 0 && getenv('AUTO_SEED') !== 'false') {
        // Load seed data from SQL file
        $seedFile = __DIR__ . '/seed_data.sql';
        if (file_exists($seedFile)) {
            $sql = file_get_contents($seedFile);
            $db->exec($sql);
        }
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Router
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Parse URL
$path = parse_url($requestUri, PHP_URL_PATH);
$path = rtrim($path, '/');

// Routes
if ($requestMethod === 'GET' && preg_match('/^\/penduduk\/([0-9]+)$/', $path, $matches)) {
    // GET /penduduk/:nik
    $nik = $matches[1];
    
    try {
        $stmt = $db->prepare("SELECT nik, nama, alamat, tanggal_lahir, jenis_kelamin, agama, status_perkawinan FROM penduduk WHERE nik = ?");
        $stmt->execute([$nik]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Data penduduk tidak ditemukan'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query error: ' . $e->getMessage()]);
    }
    
} elseif ($requestMethod === 'GET' && $path === '/penduduk') {
    // GET /penduduk - List all
    try {
        $stmt = $db->query("SELECT nik, nama, alamat, tanggal_lahir FROM penduduk ORDER BY nama");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $results,
            'count' => count($results)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query error: ' . $e->getMessage()]);
    }

} elseif ($requestMethod === 'GET' && $path === '/penduduk/search') {
    // GET /penduduk/search - Get NIK and Nama only for autocomplete
    try {
        $stmt = $db->query("SELECT nik, nama FROM penduduk ORDER BY nama");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $results,
            'count' => count($results)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Query error: ' . $e->getMessage()]);
    }
    
} elseif ($requestMethod === 'GET' && $path === '/health') {
    // Health check
    echo json_encode([
        'status' => 'healthy',
        'service' => 'Dinas Kependudukan',
        'database' => 'SQLite'
    ]);
    
} else {
    http_response_code(404);
    echo json_encode([
        'error' => 'Endpoint not found',
        'path' => $path,
        'method' => $requestMethod
    ]);
}
?>
