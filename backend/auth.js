const crypto = require('crypto');

// In-memory user database
const users = {
  // Patient: John Michael
  'john@example.com': {
    id: 'PAT001',
    email: 'john@example.com',
    password: 'password123',
    role: 'patient',
    name: 'John Michael',
    nida: '199012345678901',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  },
  
  // Patient: Mary Johnson
  'mary@example.com': {
    id: 'PAT002',
    email: 'mary@example.com',
    password: 'password123',
    role: 'patient',
    name: 'Mary Johnson',
    nida: '199087654321098',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  },
  
  // Doctor: Sarah K.
  'sarah@hospital.com': {
    id: 'DOC001',
    email: 'sarah@hospital.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sarah K.',
    specialty: 'Internal Medicine',
    facility: 'Muhimbili National Hospital',
    license: 'MED-TZ-12345'
  },
  
  // Doctor: Ahmed M.
  'ahmed@clinic.com': {
    id: 'DOC002',
    email: 'ahmed@clinic.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Ahmed M.',
    specialty: 'Radiology',
    facility: 'Aga Khan Hospital',
    license: 'MED-TZ-23456'
  },
  
  // Admin
  'admin@afyachain.com': {
    id: 'ADM001',
    email: 'admin@afyachain.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator'
  }
};

// Generate JWT-like token (simplified)
function generateToken(user) {
  const tokenData = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    timestamp: Date.now()
  };
  
  const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
  return `afya-${token}`;
}

// Verify token
function verifyToken(token) {
  try {
    if (!token.startsWith('afya-')) return null;
    
    const tokenData = token.substring(5);
    const decoded = Buffer.from(tokenData, 'base64').toString();
    const userData = JSON.parse(decoded);
    
    // Check if token is expired (24 hours)
    if (Date.now() - userData.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    // Get fresh user data
    const user = users[userData.email];
    if (!user) return null;
    
    return {
      ...user,
      token: token
    };
  } catch (error) {
    return null;
  }
}

// Login function
function login(email, password) {
  const user = users[email];
  
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  const token = generateToken(user);
  
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nida: user.nida,
      walletAddress: user.walletAddress,
      specialty: user.specialty,
      facility: user.facility
    }
  };
}

// Register new user
function register(email, password, name, role, extraData = {}) {
  if (users[email]) {
    return { success: false, error: 'User already exists' };
  }
  
  const userId = role === 'patient' ? 'PAT' : role === 'doctor' ? 'DOC' : 'ADM';
  const id = userId + (Object.keys(users).length + 1).toString().padStart(3, '0');
  
  const user = {
    id,
    email,
    password,
    role,
    name,
    ...extraData
  };
  
  users[email] = user;
  
  const token = generateToken(user);
  
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...extraData
    }
  };
}

module.exports = {
  users,
  login,
  register,
  verifyToken,
  generateToken
};