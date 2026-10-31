const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const pool = require('./src/config/database');

const app = express();
const port = process.env.PORT || 5000;

// FRONTEND_URL is preferred; retain CLIENT_ORIGIN for existing deployments.
const allowedOrigins = [process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN].filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  );
}
app.use(cors({
  origin: [...new Set(allowedOrigins)],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/lecturer', require('./src/routes/lecturerRoutes'));
app.use('/api/reference', require('./src/routes/referenceRoutes'));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Internship Management API is running',
  });
});

app.get('/api/health/database', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT current_database() AS ten_database, NOW() AS thoi_gian_server;'
    );

    res.json({
      success: true,
      message: 'Ket noi PostgreSQL thanh cong',
      database: rows[0].ten_database,
      thoiGianServer: rows[0].thoi_gian_server,
    });
  } catch {
    console.error('Ket noi PostgreSQL that bai. Kiem tra DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD va dich vu PostgreSQL.');
    res.status(500).json({
      success: false,
      message: 'Khong the ket noi PostgreSQL. Vui long kiem tra cau hinh ket noi tren server.',
    });
  }
});

app.listen(port, async () => {
  console.log(`Internship Management API listening on http://localhost:${port}`);
  try {
    await pool.query('SELECT current_database() AS ten_database, NOW() AS thoi_gian_server;');
    console.log('Ket noi PostgreSQL thanh cong');
  } catch {
    console.error('Ket noi PostgreSQL that bai. Kiem tra DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD va dich vu PostgreSQL.');
  }
});
