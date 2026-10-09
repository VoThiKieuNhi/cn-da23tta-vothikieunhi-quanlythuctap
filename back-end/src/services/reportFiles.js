const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const ROOT = path.resolve(__dirname, '../../uploads/reports');
const MAX_SIZE = 10 * 1024 * 1024;
const TYPES = { '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const fail = message => Object.assign(new Error(message), { status: 400 });

function checkType(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!TYPES[ext] || file.mimetype !== TYPES[ext]) throw fail('Chỉ chấp nhận tệp PDF, DOC hoặc DOCX đúng định dạng.');
  return ext;
}
function validate(file) {
  const ext = checkType(file), b = file.buffer;
  if (!b?.length) throw fail('Tệp báo cáo không được rỗng.');
  if (b.length > MAX_SIZE) throw Object.assign(fail('Tệp báo cáo tối đa 10MB.'), { status: 413 });
  const valid = ext === '.pdf' ? b.subarray(0, 5).toString() === '%PDF-'
    : ext === '.doc' ? b.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))
      : b.subarray(0, 4).equals(Buffer.from('504b0304', 'hex')) && b.includes(Buffer.from('[Content_Types].xml')) && b.includes(Buffer.from('word/document.xml'));
  if (!valid) throw fail('Nội dung tệp không khớp định dạng PDF, DOC hoặc DOCX.');
  return ext;
}
async function root() {
  await fs.mkdir(ROOT, { recursive: true });
  const resolved = await fs.realpath(ROOT);
  if (resolved.toLowerCase() !== ROOT.toLowerCase()) throw fail('Thư mục báo cáo không hợp lệ.');
  return resolved;
}
async function resolveFile(stored) {
  // Only server-generated relative paths inside the private reports directory are accepted.
  if (typeof stored !== 'string' || !/^reports\/report_[1-9]\d*_\d+_[0-9a-f-]{36}\.(pdf|doc|docx)$/.test(stored)) throw fail('Tệp báo cáo không hợp lệ.');
  const dir = await root(), target = path.join(dir, path.basename(stored));
  const stat = await fs.lstat(target);
  if (!stat.isFile() || stat.isSymbolicLink() || (await fs.realpath(target)).toLowerCase() !== target.toLowerCase()) throw fail('Tệp báo cáo không hợp lệ.');
  return target;
}
async function save(file, registrationId) {
  const ext = validate(file);
  if (!/^[1-9]\d*$/.test(String(registrationId))) throw fail('Đăng ký không hợp lệ.');
  const name = `report_${registrationId}_${Date.now()}_${randomUUID()}${ext}`;
  const target = path.join(await root(), name);
  try { await fs.writeFile(target, file.buffer, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') await fs.unlink(target).catch(() => {}); throw error; }
  const original = path.basename(file.originalname.replace(/\\/g, '/')).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 255);
  return { stored: `reports/${name}`, name: original || `bao-cao${ext}` };
}
async function remove(stored) {
  if (!stored) return;
  try { await fs.unlink(await resolveFile(stored)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
async function cleanup(stored) {
  try { await remove(stored); }
  catch { console.error('REPORT FILE CLEANUP: Không thể dọn tệp báo cáo; cần kiểm tra thư mục uploads/reports.'); }
}
module.exports = { ROOT, MAX_SIZE, TYPES, checkType, validate, save, resolveFile, remove, cleanup };
