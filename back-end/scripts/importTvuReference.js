const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({path:path.join(__dirname,'../.env'),quiet:true});
const pool = require('../src/config/database');
const tables = ['nganh_hoc','lop_hoc','ma_mssv_nganh','danh_muc_giang_vien_tvu'];
async function run() {
  const c = await pool.connect();
  try {
    if ((await c.query('SELECT current_database() AS name')).rows[0].name !== 'quan_ly_thuc_tap') throw Error('WRONG_DATABASE');
    const sql = fs.readFileSync(path.join(__dirname,'../seeds/tvu_reference_seed.sql'),'utf8');
    // Verify the reviewed seed's statement scope before execution; string values are data.
    const statements = sql.replace(/'(?:''|[^'])*'/g,"''").replace(/--[^\r\n]*/g,'').split(';').map(x=>x.trim()).filter(Boolean);
    for (const statement of statements) {
      if (/^(BEGIN|COMMIT)$/.test(statement)) continue;
      const table = statement.match(/^(?:CREATE TABLE IF NOT EXISTS|INSERT INTO) (\w+)/)?.[1];
      const indexTable = statement.match(/^CREATE INDEX IF NOT EXISTS \w+ ON (\w+)/)?.[1];
      if (!tables.includes(table || indexTable)) throw Error('UNEXPECTED_SEED_STATEMENT');
    }
    await c.query('BEGIN'); await c.query("SET LOCAL lock_timeout='5s'");
    const businessCounts = async () => (await c.query('SELECT (SELECT COUNT(*) FROM nguoi_dung) AS users,(SELECT COUNT(*) FROM sinh_vien) AS students,(SELECT COUNT(*) FROM giang_vien) AS lecturers')).rows[0];
    const before = await businessCounts();
    const body = sql.replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
    await c.query(body);
    const migration = fs.readFileSync(path.join(__dirname,'../migrations/004_lecturer_reference.sql'),'utf8');
    await c.query(migration.replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,''));
    const after = await businessCounts();
    if (JSON.stringify(before) !== JSON.stringify(after)) throw Error('BUSINESS_COUNTS_CHANGED');
    const counts = {};
    for (const table of tables) counts[table] = (await c.query(`SELECT COUNT(*)::int AS total FROM ${table}`)).rows[0].total;
    await c.query('COMMIT');
    console.log(JSON.stringify({counts,businessCountsUnchanged:true}));
  } catch (error) { await c.query('ROLLBACK').catch(()=>{}); throw error; }
  finally { c.release(); await pool.end(); }
}
run().catch(error=>{console.error('TVU SEED ERROR:',error.code || error.message);process.exitCode=1;});
