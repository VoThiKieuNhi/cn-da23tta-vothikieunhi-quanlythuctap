const {test}=require('node:test'),assert=require('node:assert/strict'),jwt=require('jsonwebtoken');
process.env.JWT_SECRET=require('node:crypto').randomBytes(48).toString('hex');
const file=require.resolve('../src/config/database');let mode='active';
require.cache[file]={id:file,filename:file,loaded:true,exports:{async query(sql,p){assert.ok(sql.includes('dang_hoat_dong=true'));assert.ok(sql.includes('vai_tro=$2'));if(mode==='down')throw Error('private');return {rows:mode==='active'?[{id:p[0],email:'current@tvu.edu.vn',vai_tro:p[1]}]:[]};}}};
const auth=require('../src/middleware/xacThuc');
test('JWT rechecks active account and role; unavailable DB fails closed',async()=>{
 for(const [state,expected] of [['active',200],['locked',401],['deleted',401],['roleChanged',401],['down',503]]){
  mode=state;let status=200,next=false;const token=jwt.sign({id:1,email:'old@tvu.edu.vn',vaiTro:'ADMIN'},process.env.JWT_SECRET,{expiresIn:'1m'});
  const req={get:()=>`Bearer ${token}`},res={status(s){status=s;return this;},json(value){assert.ok(!JSON.stringify(value).includes('private'));}};
  await auth(req,res,()=>{next=true;});assert.equal(status,expected);assert.equal(next,state==='active');if(next)assert.equal(req.user.email,'current@tvu.edu.vn');
 }
});
