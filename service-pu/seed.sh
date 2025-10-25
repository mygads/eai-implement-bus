#!/bin/bash
# Seed script untuk Service PU
# Usage: docker exec service-pu /app/seed.sh

echo "🌱 Seeding data for Service PU..."

# Wait for MySQL to be ready (max 30 attempts)
attempt=0
max_attempts=30
until mysql -h"${DB_HOST:-db-pu}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-mysql123}" --ssl-mode=DISABLED -e "SELECT 1" &>/dev/null; do
    attempt=$((attempt+1))
    if [ $attempt -ge $max_attempts ]; then
        echo "❌ MySQL connection timeout after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for MySQL... (attempt $attempt/$max_attempts)"
    sleep 2
done

echo "✅ MySQL is ready!"

# Execute seed SQL
mysql -h"${DB_HOST:-db-pu}" \
      -u"${DB_USER:-root}" \
      -p"${DB_PASSWORD:-mysql123}" \
      --ssl-mode=DISABLED \
      "${DB_NAME:-pu_db}" \
      < /root/seed_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Data seeded successfully!"
    COUNT=$(mysql -h"${DB_HOST:-db-pu}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-mysql123}" --ssl-mode=DISABLED -N -e "SELECT COUNT(*) FROM proyek;" "${DB_NAME:-pu_db}")
    echo "📊 Total records: $COUNT"
else
    echo "❌ Failed to seed data"
    exit 1
fi
