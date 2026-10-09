const {test}=require('node:test');
const assert=require('node:assert/strict');
const ref=require('../src/services/referenceService');
const seed=require('../seeds/tvu_reference_seed.json');
const major=seed.nganh_hoc.find(n=>n.ma_nganh==='7480201');
const base={maSinhVien:'110123033',email:'110123033@st.tvu.edu.vn',nganh:major.ten_nganh,lop:'DA23TTA',khoaHoc:'23'};
function db({missing=false,year=2023,rules=['1101']}={}){return {query:async sql=>({rows:sql.includes('FROM ma_mssv_nganh')?rules.map(prefix_mssv=>({prefix_mssv})):missing?[]:[{id:13,tenNganh:major.ten_nganh,maLop:'DA23TTA',khoaHoc:year}]})};}
test('cohort accepts 23 and 2023, rejects malformed filters',()=>{assert.equal(ref.cohort('23'),2023);assert.equal(ref.cohort('2023'),2023);for(const value of ['2023x','',[],null])assert.throws(()=>ref.cohort(value));});
test('student identity rejects email/MSSV mismatch and wrong length',()=>{assert.throws(()=>ref.studentIdentity({...base,maSinhVien:'110123034'}));assert.throws(()=>ref.studentIdentity({...base,maSinhVien:'123'}));});
test('verified student major/class/cohort accepts and normalizes',async()=>{const data={...base};await ref.validateStudent(db(),data);assert.equal(data.khoaHoc,'2023');});
test('student class must belong to major and cohort',async()=>{await assert.rejects(ref.validateStudent(db({missing:true}),{...base}));await assert.rejects(ref.validateStudent(db({year:2022}),{...base}));});
test('verified prefix must match; unverified prefix is not inferred',async()=>{const data={...base,maSinhVien:'999923033',email:'999923033@st.tvu.edu.vn'};await assert.rejects(ref.validateStudent(db(),{...data}));await ref.validateStudent(db({rules:[]}),{...data});});
test('lecturer personal reference fields come from server catalog',async()=>{const source=seed.danh_muc_giang_vien_tvu[0];const row={hoTen:source.ho_ten,hocVi:source.hoc_vi,khoaDonVi:source.khoa_don_vi};const data={danhMucGiangVienId:1,hoTen:'tampered'};await ref.applyLecturer({query:async()=>({rows:[row]})},data);assert.equal(data.hoTen,row.hoTen);assert.equal(data.boMon,row.khoaDonVi);await assert.rejects(ref.applyLecturer({query:async()=>({rows:[]})},data));});
