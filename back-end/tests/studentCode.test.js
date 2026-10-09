const {test}=require('node:test');
const assert=require('node:assert/strict');
test('MSSV sequence and generated email lifecycle',async()=>{
  const {updateStudentCode,validSequence}=await import('../../front-end/src/utils/studentCode.js');
  for(const value of ['001','033','999'])assert.ok(validSequence(value));
  for(const value of ['1','12','1234','abc',''])assert.equal(validSequence(value),false);
  let form=updateStudentCode({maSinhVien:'',email:''},'112124033');
  assert.equal(form.email,'112124033@st.tvu.edu.vn');
  form=updateStudentCode(form,'112124001');assert.equal(form.email,'112124001@st.tvu.edu.vn');
  form=updateStudentCode(form,'1121240');assert.equal(form.email,'');
  form=updateStudentCode(form,'112124999');assert.equal(form.email,'112124999@st.tvu.edu.vn');
  const manual=updateStudentCode({...form,emailManual:true},'112124033');assert.equal(manual.email,form.email);
  assert.equal(updateStudentCode({...form,email:'custom@st.tvu.edu.vn'},'112124033').email,'custom@st.tvu.edu.vn');
  const cleared=updateStudentCode({...form,email:'',emailManual:true},'112124033');assert.equal(updateStudentCode(cleared,'112124001').email,'112124001@st.tvu.edu.vn');
});
