const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://db-kesehatan:27017/kesehatan_db';

// Schema
const rekamMedisSchema = new mongoose.Schema({
  nik: { type: String, required: true, index: true },
  nama_pasien: { type: String, required: true },
  tanggal_kunjungan: { type: Date, required: true },
  faskes: { type: String, required: true },
  diagnosa: { type: String, required: true },
  tindakan: { type: String },
  dokter: { type: String },
  biaya: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const RekamMedis = mongoose.model('RekamMedis', rekamMedisSchema);

// Database initialization
async function initDatabase() {
  try {
    // Connect to MongoDB with retry
    let retries = 30;
    while (retries > 0) {
      try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully!');
        break;
      } catch (err) {
        console.log(`Retry ${31 - retries}/30: ${err.message}`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (retries === 0) {
      throw new Error('Failed to connect to MongoDB after 30 retries');
    }

    // Check if data exists
    const count = await RekamMedis.countDocuments();
    
    // Auto-seed if empty (optional - can be disabled with env AUTO_SEED=false)
    if (count === 0 && process.env.AUTO_SEED !== 'false') {
      try {
        const seedData = require('./seed_data');
        await RekamMedis.insertMany(seedData);
        console.log('Dummy data seeded successfully!');
      } catch (err) {
        console.log('Seed data file not found, skipping auto-seed');
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Dinas Kesehatan',
    database: 'MongoDB'
  });
});

app.get('/rekam-medis/:nik', async (req, res) => {
  try {
    const { nik } = req.params;
    
    const rekamMedis = await RekamMedis.find({ nik })
      .select('-__v')
      .sort({ tanggal_kunjungan: -1 });
    
    if (rekamMedis.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Data rekam medis tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: rekamMedis,
      count: rekamMedis.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/rekam-medis', async (req, res) => {
  try {
    const rekamMedis = await RekamMedis.find()
      .select('-__v')
      .sort({ tanggal_kunjungan: -1 });
    
    res.json({
      success: true,
      data: rekamMedis,
      count: rekamMedis.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
