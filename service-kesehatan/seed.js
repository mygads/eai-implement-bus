#!/usr/bin/env node
/**
 * Seed script untuk Service Kesehatan
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const seedData = require('./seed_data');

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

async function seedDatabase() {
  console.log('🌱 Seeding data for Service Kesehatan...');
  
  try {
    // Connect to MongoDB with retry
    let retries = 30;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected!');
        connected = true;
      } catch (err) {
        console.log(`Retry ${31 - retries}/30: ${err.message}`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!connected) {
      throw new Error('Failed to connect to MongoDB after 30 retries');
    }

    // Check if data exists
    const count = await RekamMedis.countDocuments();
    
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} records. Skipping seed.`);
      console.log('💡 To force reseed, delete collection first.');
    } else {
      // Insert seed data
      await RekamMedis.insertMany(seedData);
      const newCount = await RekamMedis.countDocuments();
      
      console.log('✅ Data seeded successfully!');
      console.log(`📊 Total records: ${newCount}`);
    }

    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
