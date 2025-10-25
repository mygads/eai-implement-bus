-- SQL Seed Data untuk Dinas Pendapatan
-- File: seed_pendapatan.sql

-- Create table if not exists
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
);

-- Seed dummy data (15 records)
INSERT INTO pajak (npwp, nik, nama_wajib_pajak, status, jumlah_terutang, tahun_pajak, jenis_pajak) 
VALUES
    ('12.345.678.9-001.000', '3201012345678901', 'Budi Santoso', 'Lunas', 5000000.00, 2024, 'PBB'),
    ('12.345.678.9-002.000', '3201012345678902', 'Siti Aminah', 'Belum Lunas', 3500000.00, 2024, 'PBB'),
    ('12.345.678.9-003.000', '3201012345678903', 'Ahmad Wijaya', 'Lunas', 7500000.00, 2024, 'Restoran'),
    ('12.345.678.9-004.000', '3201012345678904', 'Dewi Lestari', 'Belum Lunas', 2000000.00, 2024, 'PBB'),
    ('12.345.678.9-005.000', '3201012345678905', 'Rudi Hartono', 'Lunas', 4500000.00, 2024, 'Hotel'),
    ('12.345.678.9-006.000', '3201012345678906', 'Nur Hidayah', 'Lunas', 3000000.00, 2024, 'PBB'),
    ('12.345.678.9-007.000', '3201012345678907', 'Eko Prasetyo', 'Lunas', 8500000.00, 2024, 'Restoran'),
    ('12.345.678.9-008.000', '3201012345678908', 'Linda Wijayanti', 'Belum Lunas', 2500000.00, 2024, 'PBB'),
    ('12.345.678.9-009.000', '3201012345678909', 'Hendra Gunawan', 'Lunas', 6000000.00, 2024, 'Hotel'),
    ('12.345.678.9-010.000', '3201012345678910', 'Rina Sari', 'Belum Lunas', 1800000.00, 2024, 'PBB'),
    ('12.345.678.9-011.000', '3201012345678911', 'Bambang Susilo', 'Lunas', 5500000.00, 2024, 'Restoran'),
    ('12.345.678.9-012.000', '3201012345678912', 'Fitri Handayani', 'Lunas', 4200000.00, 2024, 'PBB'),
    ('12.345.678.9-013.000', '3201012345678913', 'Agus Salim', 'Belum Lunas', 3200000.00, 2024, 'Hotel'),
    ('12.345.678.9-014.000', '3201012345678914', 'Maya Kusuma', 'Lunas', 4800000.00, 2024, 'PBB'),
    ('12.345.678.9-015.000', '3201012345678915', 'Dedi Kurniawan', 'Lunas', 6500000.00, 2024, 'Restoran')
ON CONFLICT (npwp) DO NOTHING;
