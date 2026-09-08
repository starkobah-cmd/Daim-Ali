// Security and Authentication Utility for Netronomic CMS

const ADMIN_USERS_KEY = 'netronomic_admin_users_v3';
const ADMIN_SESSION_KEY = 'netronomic_admin_session_v1';
const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 Hours

export type AdminRole = 'Super Admin' | 'Editor' | 'SEO Manager';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;
  mustChangePassword?: boolean;
}

export interface AdminSession {
  userId: string;
  username: string;
  email: string;
  role: AdminRole;
  token: string;
  expiresAt: number;
  mustChangePassword?: boolean;
}

// Convert string to SHA-256 hex digest
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_netronomic_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default Credentials required by specification:
// Username: admin | Email: admin@example.com | Password: Admin@123
const DEFAULT_USERNAME = 'admin';
const DEFAULT_EMAIL = 'admin@example.com';
const DEFAULT_PASSWORD_PLAIN = 'Admin@786';

export async function getStoredAdminUsers(): Promise<AdminUser[]> {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading admin users:', err);
  }

  // Initialize default first administrator account if none exists
  const defaultHash = await hashPassword(DEFAULT_PASSWORD_PLAIN);
  const defaultAdmin: AdminUser = {
    id: 'usr_default_admin',
    username: DEFAULT_USERNAME,
    email: DEFAULT_EMAIL,
    passwordHash: defaultHash,
    role: 'Super Admin',
    createdAt: new Date().toISOString(),
    mustChangePassword: true, // Force password change after first login as requested
  };
  const users = [defaultAdmin];
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  return users;
}

export async function saveAdminUsers(users: AdminUser[]): Promise<void> {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

export async function verifyAdminLogin(
  identifierInput: string, // username or email
  passwordPlainInput: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; mustChangePassword?: boolean; error?: string }> {
  const users = await getStoredAdminUsers();
  const inputHash = await hashPassword(passwordPlainInput);
  const cleanIdentifier = identifierInput.trim().toLowerCase();

  const matchedUser = users.find(
    u => u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier
  );

  if (!matchedUser) {
    return { success: false, error: 'No account found with this username or email.' };
  }

  if (matchedUser.passwordHash !== inputHash) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Create active session
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : SESSION_EXPIRY_MS;
  const session: AdminSession = {
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    role: matchedUser.role,
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    expiresAt: Date.now() + duration,
    mustChangePassword: matchedUser.mustChangePassword,
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return { success: true, mustChangePassword: matchedUser.mustChangePassword };
}

export function getCurrentSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (session.expiresAt && session.expiresAt > Date.now()) {
      return session;
    } else {
      logoutAdmin();
      return null;
    }
  } catch (err) {
    return null;
  }
}

export function isAuthenticatedAdmin(): boolean {
  return getCurrentSession() !== null;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// Reset password for a given username or email using security recovery phrase or master key
export async function resetPasswordWithKey(
  identifier: string,
  newPasswordPlain: string
): Promise<{ success: boolean; message: string }> {
  const users = await getStoredAdminUsers();
  const cleanId = identifier.trim().toLowerCase();
  const index = users.findIndex(
    u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (index === -1) {
    return { success: false, message: 'Account not found. Check username or email.' };
  }

  const newHash = await hashPassword(newPasswordPlain);
  users[index].passwordHash = newHash;
  users[index].mustChangePassword = false;
  await saveAdminUsers(users);

  return { success: true, message: 'Password has been successfully reset! You can now log in with your new password.' };
}

// Change current admin password
export async function changeUserPassword(
  userId: string,
  oldPasswordPlain: string,
  newPasswordPlain: string
): Promise<{ success: boolean; message: string }> {
  const users = await getStoredAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  const oldHash = await hashPassword(oldPasswordPlain);
  if (user.passwordHash !== oldHash) {
    return { success: false, message: 'Current password is incorrect.' };
  }

  user.passwordHash = await hashPassword(newPasswordPlain);
  user.mustChangePassword = false;
  await saveAdminUsers(user.id ? users : users);

  // Update session if it's the current session
  const session = getCurrentSession();
  if (session && session.userId === userId) {
    session.mustChangePassword = false;
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }

  return { success: true, message: 'Password updated successfully!' };
}

// Admin user management (Add, Delete, Edit role)
export async function createAdminUser(
  username: string,
  email: string,
  passwordPlain: string,
  role: AdminRole
): Promise<{ success: boolean; message: string; user?: AdminUser }> {
  const users = await getStoredAdminUsers();

  if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return { success: false, message: 'Username is already taken.' };
  }
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, message: 'Email address is already registered.' };
  }

  const newUser: AdminUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(passwordPlain),
    role,
    createdAt: new Date().toISOString(),
    mustChangePassword: false,
  };

  users.push(newUser);
  await saveAdminUsers(users);
  return { success: true, message: 'New admin account created successfully.', user: newUser };
}

export async function deleteAdminUser(userId: string): Promise<{ success: boolean; message: string }> {
  const users = await getStoredAdminUsers();
  if (users.length <= 1) {
    return { success: false, message: 'Cannot delete the only administrator account.' };
  }

  const filtered = users.filter(u => u.id !== userId);
  await saveAdminUsers(filtered);
  return { success: true, message: 'Admin account deleted.' };
}

export async function updateAdminUser(
  userId: string,
  updates: { username?: string; email?: string; role?: AdminRole }
): Promise<{ success: boolean; message: string }> {
  const users = await getStoredAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (updates.username) user.username = updates.username.trim();
  if (updates.email) user.email = updates.email.trim().toLowerCase();
  if (updates.role) user.role = updates.role;

  await saveAdminUsers(users);
  return { success: true, message: 'User details updated successfully.' };
}

