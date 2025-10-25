#!/usr/bin/env python3
"""
Seed script untuk Service Pendapatan
Usage: python seed.py
"""

import psycopg2
import os
import sys
import time

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db-pendapatan'),
    'database': os.getenv('DB_NAME', 'pendapatan_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres123'),
    'port': os.getenv('DB_PORT', '5432')
}

def wait_for_db(max_retries=30):
    """Wait for database to be ready"""
    print("⏳ Waiting for database to be ready...")
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            conn.close()
            print("✅ Database is ready!")
            return True
        except Exception as e:
            print(f"Retry {i+1}/{max_retries}: {e}")
            time.sleep(2)
    return False

def seed_data():
    """Seed data from SQL file"""
    print("🌱 Seeding data for Service Pendapatan...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Read and execute seed SQL
        with open('/app/seed_data.sql', 'r') as f:
            sql = f.read()
            cur.execute(sql)
        
        # Check count
        cur.execute("SELECT COUNT(*) FROM pajak")
        count = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Data seeded successfully!")
        print(f"📊 Total records: {count}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to seed data: {e}")
        return False

if __name__ == '__main__':
    if not wait_for_db():
        print("❌ Database not available")
        sys.exit(1)
    
    if seed_data():
        print("✅ Seeding completed!")
        sys.exit(0)
    else:
        print("❌ Seeding failed!")
        sys.exit(1)
