FROM php:8.2-cli

# Install SQLite extension
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
COPY index.php /app/
COPY seed_data.sql /app/
COPY seed.sh /app/

# Make seed script executable
RUN chmod +x /app/seed.sh

# Create data directory
RUN mkdir -p /app/data && \
    chmod -R 777 /app/data

EXPOSE 80

# Use PHP built-in server
CMD ["php", "-S", "0.0.0.0:80", "-t", "/app"]
