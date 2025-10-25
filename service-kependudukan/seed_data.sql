-- SQL Seed Data untuk Dinas Kependudukan
-- File: seed_kependudukan.sql

-- Create table if not exists
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
);

-- Seed dummy data (15 records)
INSERT OR IGNORE INTO penduduk (nik, nama, alamat, tanggal_lahir, jenis_kelamin, agama, status_perkawinan) VALUES
('3201012345678901', 'Budi Santoso', 'Jl. Merdeka No. 123, Jakarta Pusat', '1985-05-15', 'L', 'Islam', 'Menikah'),
('3201012345678902', 'Siti Aminah', 'Jl. Sudirman No. 45, Jakarta Selatan', '1990-08-22', 'P', 'Islam', 'Menikah'),
('3201012345678903', 'Ahmad Wijaya', 'Jl. Thamrin No. 67, Jakarta Pusat', '1988-03-10', 'L', 'Islam', 'Belum Menikah'),
('3201012345678904', 'Dewi Lestari', 'Jl. Gatot Subroto No. 89, Jakarta Selatan', '1992-11-30', 'P', 'Kristen', 'Menikah'),
('3201012345678905', 'Rudi Hartono', 'Jl. Rasuna Said No. 12, Jakarta Selatan', '1987-07-18', 'L', 'Buddha', 'Belum Menikah'),
('3201012345678906', 'Nur Hidayah', 'Jl. Kuningan No. 34, Jakarta Selatan', '1995-02-14', 'P', 'Islam', 'Menikah'),
('3201012345678907', 'Eko Prasetyo', 'Jl. Senayan No. 56, Jakarta Pusat', '1983-09-25', 'L', 'Kristen', 'Menikah'),
('3201012345678908', 'Linda Wijayanti', 'Jl. Menteng No. 78, Jakarta Pusat', '1991-12-08', 'P', 'Islam', 'Belum Menikah'),
('3201012345678909', 'Hendra Gunawan', 'Jl. Tanah Abang No. 90, Jakarta Pusat', '1986-06-17', 'L', 'Buddha', 'Menikah'),
('3201012345678910', 'Rina Sari', 'Jl. Blok M No. 23, Jakarta Selatan', '1993-04-20', 'P', 'Islam', 'Belum Menikah'),
('3201012345678911', 'Bambang Susilo', 'Jl. Kebayoran No. 45, Jakarta Selatan', '1984-10-12', 'L', 'Islam', 'Menikah'),
('3201012345678912', 'Fitri Handayani', 'Jl. Tebet No. 67, Jakarta Selatan', '1989-07-03', 'P', 'Kristen', 'Menikah'),
('3201012345678913', 'Agus Salim', 'Jl. Cikini No. 89, Jakarta Pusat', '1994-01-28', 'L', 'Islam', 'Belum Menikah'),
('3201012345678914', 'Maya Kusuma', 'Jl. Salemba No. 12, Jakarta Pusat', '1990-11-15', 'P', 'Hindu', 'Menikah'),
('3201012345678915', 'Dedi Kurniawan', 'Jl. Matraman No. 34, Jakarta Timur', '1987-03-22', 'L', 'Islam', 'Menikah');
