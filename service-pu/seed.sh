#!/bin/bash
# Seed script untuk Service PU
# Usage: docker exec service-pu /app/seed.sh

echo "🌱 Seeding data for Service PU..."

# Wait for MySQL to be ready
until mysql -h"${DB_HOST:-db-pu}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-mysql123}" -e "SELECT 1" &>/dev/null; do
    echo "⏳ Waiting for MySQL..."
    sleep 2
done

echo "✅ MySQL is ready!"

# Execute seed SQL
mysql -h"${DB_HOST:-db-pu}" \
      -u"${DB_USER:-root}" \
      -p"${DB_PASSWORD:-mysql123}" \
      "${DB_NAME:-pu_db}" \
      < /app/seed_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Data seeded successfully!"
    COUNT=$(mysql -h"${DB_HOST:-db-pu}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-mysql123}" -N -e "SELECT COUNT(*) FROM proyek;" "${DB_NAME:-pu_db}")
    echo "📊 Total records: $COUNT"
else
    echo "❌ Failed to seed data"
    exit 1
fi
