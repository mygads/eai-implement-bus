#!/bin/bash
# Seed script untuk Service Kependudukan
# Usage: ./seed.sh

echo "🌱 Seeding data for Service Kependudukan..."

DB_PATH="/var/www/html/data/kependudukan.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "⚠️  Database not found. Creating new database..."
fi

# Run seed SQL
sqlite3 "$DB_PATH" < /var/www/html/seed_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Data seeded successfully!"
    echo "📊 Total records:"
    sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM penduduk;"
else
    echo "❌ Failed to seed data"
    exit 1
fi
