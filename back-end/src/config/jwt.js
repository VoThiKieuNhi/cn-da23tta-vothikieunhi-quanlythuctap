function jwtConfig() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim() || secret === 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET' || secret.trim().length < 32) {
    throw new Error('Can cau hinh JWT_SECRET ngau nhien dai it nhat 32 ky tu.');
  }
  return { secret, expiresIn: process.env.JWT_EXPIRES_IN || '8h' };
}

module.exports = jwtConfig;
