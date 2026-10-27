const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_placement_portal_2026_experience',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        graduationYear: user.graduationYear,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });
};

module.exports = {
  generateToken,
  sendTokenResponse,
};
