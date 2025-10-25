-- SQL Seed Data untuk Dinas Pekerjaan Umum
-- File: seed_pu.sql

-- Create table if not exists
CREATE TABLE IF NOT EXISTS proyek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik VARCHAR(20) NOT NULL,
    nama_proyek VARCHAR(200) NOT NULL,
    lokasi VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL,
    anggaran DECIMAL(15, 2) DEFAULT 0,
    tahun_anggaran INT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nik (nik)
);

-- Seed dummy data (20 records)
INSERT IGNORE INTO proyek (nik, nama_proyek, lokasi, status, anggaran, tahun_anggaran, keterangan) VALUES
('3201012345678901', 'Pembangunan Jalan Tol Dalam Kota', 'Jakarta Pusat', 'Berjalan', 500000000000, 2024, 'Proyek infrastruktur jalan tol'),
('3201012345678902', 'Renovasi Jembatan Layang', 'Jakarta Selatan', 'Selesai', 150000000000, 2023, 'Renovasi jembatan untuk keselamatan'),
('3201012345678903', 'Pembangunan Fly Over', 'Jakarta Timur', 'Berjalan', 200000000000, 2024, 'Mengurangi kemacetan'),
('3201012345678904', 'Perbaikan Trotoar', 'Jakarta Barat', 'Direncanakan', 50000000000, 2024, 'Perbaikan trotoar pedestrian'),
('3201012345678905', 'Pembangunan Underpass', 'Jakarta Utara', 'Berjalan', 300000000000, 2024, 'Underpass untuk akses cepat'),
('3201012345678906', 'Pembangunan Jembatan Penghubung', 'Jakarta Timur', 'Berjalan', 180000000000, 2024, 'Jembatan penghubung antar wilayah'),
('3201012345678907', 'Pelebaran Jalan Protokol', 'Jakarta Pusat', 'Direncanakan', 120000000000, 2024, 'Pelebaran jalan untuk mengurangi macet'),
('3201012345678908', 'Renovasi Terminal Bus', 'Jakarta Barat', 'Berjalan', 80000000000, 2024, 'Modernisasi terminal bus'),
('3201012345678909', 'Pembangunan Jalur Sepeda', 'Jakarta Selatan', 'Selesai', 30000000000, 2023, 'Jalur khusus untuk sepeda'),
('3201012345678910', 'Perbaikan Gorong-gorong', 'Jakarta Utara', 'Berjalan', 45000000000, 2024, 'Mencegah banjir'),
('3201012345678911', 'Pembangunan Taman Kota', 'Jakarta Pusat', 'Selesai', 25000000000, 2023, 'Ruang terbuka hijau'),
('3201012345678912', 'Renovasi Pedestrian', 'Jakarta Selatan', 'Berjalan', 60000000000, 2024, 'Perbaikan jalur pejalan kaki'),
('3201012345678913', 'Pembangunan Halte Bus', 'Jakarta Timur', 'Direncanakan', 35000000000, 2024, 'Halte bus modern'),
('3201012345678914', 'Perbaikan Sistem Drainase', 'Jakarta Barat', 'Berjalan', 90000000000, 2024, 'Sistem drainase anti banjir'),
('3201012345678915', 'Pembangunan Jalan Lingkar', 'Jakarta Utara', 'Berjalan', 400000000000, 2024, 'Jalan alternatif mengurangi macet'),
('3201012345678901', 'Renovasi Jalan Rusak', 'Jakarta Selatan', 'Berjalan', 70000000000, 2024, 'Perbaikan jalan rusak'),
('3201012345678902', 'Pembangunan Lampu Jalan', 'Jakarta Timur', 'Selesai', 20000000000, 2023, 'Pemasangan lampu LED'),
('3201012345678903', 'Perbaikan Marka Jalan', 'Jakarta Pusat', 'Direncanakan', 15000000000, 2024, 'Pengecatan marka jalan'),
('3201012345678904', 'Pembangunan Rambu Lalu Lintas', 'Jakarta Barat', 'Berjalan', 10000000000, 2024, 'Pemasangan rambu keselamatan'),
('3201012345678905', 'Renovasi Jembatan Penyeberangan', 'Jakarta Utara', 'Berjalan', 55000000000, 2024, 'Jembatan penyeberangan orang');
