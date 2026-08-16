import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digi8',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    try {
      // Basic tables matching schema
      await connection.query(`
        CREATE DATABASE IF NOT EXISTS digi8 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          first_name VARCHAR(255),
          last_name VARCHAR(255),

        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        industry VARCHAR(255),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        services JSON,
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        quote_number VARCHAR(100),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        website VARCHAR(255),
        project_type VARCHAR(100),
        project_details TEXT,
        total_estimate DECIMAL(10,2),
        selected_features JSON,
        status VARCHAR(50) DEFAULT 'pending',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255)
      )
    `);
      await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Normal User',
        status VARCHAR(50) DEFAULT 'active',
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP NULL
      );
    `);

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@digi8solutions.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminDigi8Password2026!';

      const [adminRows]: any = await connection.query('SELECT * FROM admin_users WHERE email = ?', [adminEmail]);
      if (adminRows.length === 0) {
        const defaultHash = await bcrypt.hash(adminPassword, 10);
        await connection.query(
          'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          ['Digi-8 Super Admin', adminEmail, defaultHash, 'Super Admin']
        );
        console.log(`[DB INFO] Default Super Admin user created: ${adminEmail}`);
      }

      await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        description TEXT,
        category VARCHAR(100),
        image_url VARCHAR(255),
        client VARCHAR(255),
        completion_date VARCHAR(100),
        results JSON,
        sort_order INT DEFAULT 0
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        role VARCHAR(100),
        company VARCHAR(255),
        content TEXT,
        rating INT DEFAULT 5,
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT FALSE
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(255),
        slug VARCHAR(255) UNIQUE,
        excerpt TEXT,
        content LONGTEXT,
        author VARCHAR(100),
        category VARCHAR(100),
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft'
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS service_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        price VARCHAR(100),
        features JSON
      )
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ticket_number VARCHAR(100) UNIQUE NOT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        user_phone VARCHAR(50),
        service_category VARCHAR(100),
        subject VARCHAR(255),
        description TEXT,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        assigned_to VARCHAR(255) DEFAULT 'Support Desk',
        resolution_notes TEXT
      )
    `);

      console.log('Database initialized successfully.');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn('[DB WARNING] Local MySQL connection failed. Server running in offline/mock mode:', (error as any).message);
  }
};

export default pool;

