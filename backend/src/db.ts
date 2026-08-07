import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const storageDir = path.resolve(process.cwd(), '../storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const dbPath = path.join(storageDir, 'freshvision.db');
export const db = new sqlite3.Database(dbPath);

export function initDatabase() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Quality Inspector',
        name TEXT NOT NULL,
        mobile TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `);

    // Inspections Table
    db.run(`
      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        food_type TEXT NOT NULL,
        metrics_json TEXT NOT NULL,
        defects_json TEXT NOT NULL,
        detected_items_json TEXT DEFAULT '[]',
        raw_image_url TEXT NOT NULL,
        processing_time_ms INTEGER DEFAULT 350,
        user_id TEXT DEFAULT 'guest'
      )
    `);

    // Batches Table
    db.run(`
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        inspector_name TEXT NOT NULL,
        factory_line TEXT NOT NULL,
        total_items INTEGER DEFAULT 0,
        accepted_items INTEGER DEFAULT 0,
        rejected_items INTEGER DEFAULT 0,
        avg_freshness REAL DEFAULT 0.0
      )
    `);

    // Audit Logs
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        user_email TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT DEFAULT ''
      )
    `);

    // Create Default SuperAdmin User if not exists
    db.get('SELECT * FROM users WHERE email = ?', ['admin@freshvision.ai'], async (err, row) => {
      if (!row) {
        const hash = await bcrypt.hash('Admin@12345', 10);
        db.run(
          `INSERT INTO users (id, email, password_hash, role, name, mobile, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'USR-0001',
            'admin@freshvision.ai',
            hash,
            'SuperAdmin',
            'Chief Quality Inspector',
            '+1 (800) 555-FOOD',
            new Date().toISOString(),
          ]
        );
        console.log('Default SuperAdmin account created: admin@freshvision.ai / Admin@12345');
      }
    });
  });
}
