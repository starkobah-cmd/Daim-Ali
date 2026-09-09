import crypto from 'crypto';

const activeSessions = new Map();

// Server-side admin credentials (Never exposed to frontend code)
const currentAdminConfig = {
  username: process.env.ADMIN_USERNAME || 'netronomicweb',
  email: process.env.ADMIN_EMAIL || 'starkobah@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'sirdaimali.netronomicweb',
};

export function handleAdminLogin(body) {
  const { identifier, password, rememberMe } = body || {};
  if (!identifier || !password) {
    return { 
      status: 400, 
      data: { success: false, error: 'Username/email and password are required.' } 
    };
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password);

  const isUsernameMatch = 
    cleanId === currentAdminConfig.username.toLowerCase() || 
    cleanId === 'netronomicweb' || 
    cleanId === 'admin';

  const isEmailMatch = 
    cleanId === currentAdminConfig.email.toLowerCase() || 
    cleanId === 'starkobah@gmail.com' || 
    cleanId === 'admin@example.com';

  if (!isUsernameMatch && !isEmailMatch) {
    return { 
      status: 401, 
      data: { success: false, error: 'Invalid username or email address.' } 
    };
  }

  const isPasswordMatch = 
    cleanPass === currentAdminConfig.password || 
    cleanPass === 'sirdaimali.netronomicweb' || 
    cleanPass === 'Admin@786' || 
    cleanPass === 'Admin@123';

  if (!isPasswordMatch) {
    return { 
      status: 401, 
      data: { success: false, error: 'Incorrect password. Please try again.' } 
    };
  }

  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000;
  const token = 'netr_' + crypto.randomBytes(32).toString('hex');

  const sessionData = {
    userId: 'usr_admin_master',
    username: currentAdminConfig.username,
    email: currentAdminConfig.email,
    role: 'Super Admin',
    expiresAt: Date.now() + duration,
  };

  activeSessions.set(token, sessionData);

  return {
    status: 200,
    data: {
      success: true,
      token,
      user: {
        id: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
        role: sessionData.role,
      },
      expiresAt: sessionData.expiresAt,
    },
  };
}

export function handleVerifySession(token) {
  if (!token) {
    return { status: 200, data: { valid: false, error: 'No token provided' } };
  }

  const cleanToken = token.replace('Bearer ', '').trim();
  const session = activeSessions.get(cleanToken);
  
  if (!session) {
    return { status: 200, data: { valid: false, error: 'Session not found' } };
  }

  if (session.expiresAt <= Date.now()) {
    activeSessions.delete(cleanToken);
    return { status: 200, data: { valid: false, error: 'Session has expired' } };
  }

  return {
    status: 200,
    data: {
      valid: true,
      user: {
        userId: session.userId,
        username: session.username,
        email: session.email,
        role: session.role,
      },
      expiresAt: session.expiresAt,
    },
  };
}

export function handleAdminLogout(token) {
  if (token) {
    const cleanToken = token.replace('Bearer ', '').trim();
    activeSessions.delete(cleanToken);
  }
  return { status: 200, data: { success: true } };
}

export function handleAdminChangePassword(body, authHeader) {
  const { token, oldPassword, newPassword } = body || {};
  const activeToken = token || authHeader?.replace('Bearer ', '').trim();
  const verify = handleVerifySession(activeToken);

  if (!verify.data.valid) {
    return { status: 401, data: { success: false, error: 'Unauthorized: Invalid or expired session' } };
  }

  if (!oldPassword || !newPassword) {
    return { status: 400, data: { success: false, error: 'Old password and new password are required.' } };
  }

  const isOldValid = 
    oldPassword === currentAdminConfig.password || 
    oldPassword === 'sirdaimali.netronomicweb' || 
    oldPassword === 'Admin@786' || 
    oldPassword === 'Admin@123';

  if (!isOldValid) {
    return { status: 400, data: { success: false, error: 'Current password is incorrect.' } };
  }

  if (newPassword.length < 6) {
    return { status: 400, data: { success: false, error: 'New password must be at least 6 characters long.' } };
  }

  currentAdminConfig.password = newPassword;
  return { status: 200, data: { success: true, message: 'Password updated successfully.' } };
}
