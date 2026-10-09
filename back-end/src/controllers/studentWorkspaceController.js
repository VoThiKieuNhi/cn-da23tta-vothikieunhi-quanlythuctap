const pool=require('../config/database');
async function workspace(req,res){
 try {
  const student=(await pool.query('SELECT id,ma_sinh_vien AS "maSinhVien",ho_ten AS "hoTen",lop,nganh FROM sinh_vien WHERE nguoi_dung_id=$1',[req.user.id])).rows[0];
  if(!student)return res.status(403).json({success:false,message:'Tài khoản chưa có hồ sơ sinh viên.'});
  const registration=(await pool.query(`SELECT dk.id,dk.trang_thai AS "trangThai",dk.ly_do_tu_choi AS "lyDoTuChoi",dk.vi_tri_thuc_tap AS "viTriThucTap",
   dk.ngay_tao AS "ngayDangKy",to_char(dk.ngay_bat_dau,'YYYY-MM-DD') AS "ngayBatDau",to_char(dk.ngay_ket_thuc,'YYYY-MM-DD') AS "ngayKetThuc",
   dn.ten_doanh_nghiep AS "tenDoanhNghiep",dn.dia_chi AS "diaChi",dt.hoc_ky AS "hocKy",dt.nam_hoc AS "namHoc"
   FROM dang_ky_thuc_tap dk JOIN doanh_nghiep dn ON dn.id=dk.doanh_nghiep_id JOIN dot_thuc_tap dt ON dt.id=dk.dot_thuc_tap_id
   WHERE dk.sinh_vien_id=$1 ORDER BY dk.ngay_tao DESC,dk.id DESC LIMIT 1`,[student.id])).rows[0]||null;
  let lecturers=[],progress=[],reports=[],evaluations=[];
  if(registration){
   const results=await Promise.all([
    pool.query(`SELECT gv.id,gv.ho_ten AS "hoTen",gv.hoc_vi AS "hocVi",pc.ngay_phan_cong AS "ngayPhanCong" FROM phan_cong_giang_vien pc JOIN giang_vien gv ON gv.id=pc.giang_vien_id WHERE pc.dang_ky_thuc_tap_id=$1 ORDER BY pc.ngay_phan_cong DESC,pc.id DESC`,[registration.id]),
    pool.query(`SELECT id,so_tuan AS "soTuan",tieu_de AS "tieuDe",noi_dung AS "noiDung",to_char(ngay_bao_cao,'YYYY-MM-DD') AS "ngayBaoCao",nhan_xet_giang_vien AS "nhanXetGiangVien" FROM tien_do_thuc_tap WHERE dang_ky_thuc_tap_id=$1 ORDER BY so_tuan DESC,id DESC`,[registration.id]),
    pool.query(`SELECT id,ten_bao_cao AS "tenBaoCao",ten_file AS "tenFile",ngay_nop AS "ngayNop",trang_thai AS "trangThai" FROM bao_cao_thuc_tap WHERE dang_ky_thuc_tap_id=$1 ORDER BY ngay_nop DESC,id DESC`,[registration.id]),
    pool.query(`SELECT dg.id,dg.diem_chuyen_mon AS "diemChuyenMon",dg.diem_thai_do AS "diemThaiDo",dg.diem_bao_cao AS "diemBaoCao",dg.diem_tong AS "diemTong",dg.nhan_xet AS "nhanXet",dg.ngay_danh_gia AS "ngayDanhGia",gv.ho_ten AS "giangVien" FROM danh_gia_thuc_tap dg JOIN giang_vien gv ON gv.id=dg.giang_vien_id WHERE dg.dang_ky_thuc_tap_id=$1 ORDER BY dg.ngay_danh_gia DESC,dg.id DESC`,[registration.id]),
   ]);
   [lecturers,progress,reports,evaluations]=results.map(result=>result.rows);
  }
  res.json({success:true,data:{student,registration,lecturers,progress,reports,evaluations}});
 }catch(error){console.error('STUDENT WORKSPACE ERROR:',/^[0-9A-Z]{5}$/.test(error.code||'')?error.code:'DB_ERROR');res.status(500).json({success:false,message:'Không thể tải thông tin thực tập. Vui lòng thử lại.'});}
}
module.exports={workspace};
