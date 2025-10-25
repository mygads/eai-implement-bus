from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import time

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db-pendapatan'),
    'database': os.getenv('DB_NAME', 'pendapatan_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres123'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def init_database():
    """Initialize database and seed dummy data"""
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = get_db_connection()
            if conn:
                cur = conn.cursor()
                
                # Create table first
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS pajak (
                        id SERIAL PRIMARY KEY,
                        npwp VARCHAR(20) UNIQUE NOT NULL,
                        nik VARCHAR(20) NOT NULL,
                        nama_wajib_pajak VARCHAR(100) NOT NULL,
                        status VARCHAR(20) NOT NULL,
                        jumlah_terutang DECIMAL(15, 2) DEFAULT 0,
                        tahun_pajak INTEGER NOT NULL,
                        jenis_pajak VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
                
                # Check if table is empty
                cur.execute("SELECT COUNT(*) FROM pajak")
                count = cur.fetchone()[0]
                
                # Auto-seed if empty (optional - can be disabled with env AUTO_SEED=false)
                if count == 0 and os.getenv('AUTO_SEED', 'true').lower() != 'false':
                    seed_file = '/app/seed_data.sql'
                    if os.path.exists(seed_file):
                        with open(seed_file, 'r') as f:
                            sql = f.read()
                            cur.execute(sql)
                        conn.commit()
                        print("Dummy data seeded successfully!")
                
                cur.close()
                conn.close()
                print("Database initialized successfully!")
                return True
        except Exception as e:
            print(f"Retry {retry_count + 1}/{max_retries}: {e}")
            retry_count += 1
            time.sleep(2)
    
    print("Failed to initialize database after maximum retries")
    return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Dinas Pendapatan',
        'database': 'PostgreSQL'
    })

@app.route('/pajak/<npwp>', methods=['GET'])
def get_pajak_by_npwp(npwp):
    """Get pajak data by NPWP"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT npwp, nik, nama_wajib_pajak, status, jumlah_terutang, tahun_pajak, jenis_pajak
            FROM pajak 
            WHERE npwp = %s
        """, (npwp,))
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result:
            # Convert Decimal to float for JSON serialization
            result['jumlah_terutang'] = float(result['jumlah_terutang'])
            return jsonify({
                'success': True,
                'data': dict(result)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Data pajak tidak ditemukan'
            }), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/pajak/nik/<nik>', methods=['GET'])
def get_pajak_by_nik(nik):
    """Get pajak data by NIK"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT npwp, nik, nama_wajib_pajak, status, jumlah_terutang, tahun_pajak, jenis_pajak
            FROM pajak 
            WHERE nik = %s
        """, (nik,))
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        if results:
            # Convert Decimal to float
            for result in results:
                result['jumlah_terutang'] = float(result['jumlah_terutang'])
            
            return jsonify({
                'success': True,
                'data': [dict(r) for r in results],
                'count': len(results)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Data pajak tidak ditemukan'
            }), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/pajak', methods=['GET'])
def get_all_pajak():
    """Get all pajak data"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'error': 'Database connection failed'}), 500
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT npwp, nik, nama_wajib_pajak, status, jumlah_terutang, tahun_pajak, jenis_pajak
            FROM pajak 
            ORDER BY nama_wajib_pajak
        """)
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        # Convert Decimal to float
        for result in results:
            result['jumlah_terutang'] = float(result['jumlah_terutang'])
        
        return jsonify({
            'success': True,
            'data': [dict(r) for r in results],
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
