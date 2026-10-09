const { Pool, types } = require('pg');
// Legacy business timestamps store Vietnam wall time. Never interpret them using the OS timezone.
types.setTypeParser(1114, value => new Date(value.replace(' ', 'T') + '+07:00'));
types.setTypeParser(1082, value => value);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
  options: '-c timezone=Asia/Ho_Chi_Minh',
});

pool.on('error', () => {
  console.error('Loi ket noi PostgreSQL trong pool. Kiem tra cau hinh va trang thai PostgreSQL.');
});

module.exports = pool;
