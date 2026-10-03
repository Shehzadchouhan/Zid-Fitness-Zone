import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { normalizeIndianMobile } from '../shared/phone.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = process.env.SFZ_STORE_PATH || path.join(__dirname, 'data', 'store.json');
const UPLOADS_PATH = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_PATH, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const scrypt = promisify(crypto.scrypt);
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_PATH,
    filename: (req, file, callback) => {
      const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype];
      callback(null, `${crypto.randomUUID()}${extension}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Upload a JPG, PNG, or WebP image.'));
    }
    return callback(null, true);
  }
});

app.use(cors());
app.use(express.json());

// Helper to read database
function readData() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data.accounts)) data.accounts = [];
    if (!Array.isArray(data.payments)) data.payments = [];
    return data;
  } catch (err) {
    console.error('Error reading store.json:', err);
    return { stats: {}, leads: [], members: [], classes: [], recentCheckins: [], accounts: [], payments: [] };
  }
}

// Helper to write database
function writeData(data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing store.json:', err);
    return false;
  }
}

function createSession(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ error: 'Invalid session.' });
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(signature, 'base64url');
  } catch {
    return res.status(401).json({ error: 'Invalid session.' });
  }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(401).json({ error: 'Invalid session.' });
  }

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!user.sub || user.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid session.' });
  }
}

function requireOwner(req, res, next) {
  if (req.user?.role !== 'owner') return res.status(403).json({ error: 'Owner access required.' });
  return next();
}

function requireMember(req, res, next) {
  if (req.user?.role !== 'member') return res.status(403).json({ error: 'Member access required.' });
  return next();
}

function getMemberAccount(data, userId) {
  return data.accounts.find(account => account.id === userId && account.role === 'member');
}

function getStreakCount(progress) {
  const dates = [...new Set(progress.map(entry => entry.date))].sort().reverse();
  if (!dates.length) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previousDate = new Date(`${dates[index - 1]}T00:00:00.000Z`).getTime();
    const currentDate = new Date(`${dates[index]}T00:00:00.000Z`).getTime();
    if (previousDate - currentDate !== 24 * 60 * 60 * 1000) break;
    streak += 1;
  }
  return streak;
}

function handlePhotoUpload(req, res, next) {
  photoUpload.single('photo')(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || 'Could not upload photo.' });
    return next();
  });
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = await scrypt(password, salt, 64);
  return { salt, hash: hash.toString('hex') };
}

async function verifyPassword(password, account) {
  const hash = await scrypt(password, account.salt, 64);
  const stored = Buffer.from(account.passwordHash, 'hex');
  return hash.length === stored.length && crypto.timingSafeEqual(hash, stored);
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Enter a name between 2 and 80 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });

  const data = readData();
  if (email === String(process.env.OWNER_EMAIL || '').trim().toLowerCase() || data.accounts.some(account => account.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const credentials = await hashPassword(password);
  const account = {
    id: `user-${crypto.randomUUID()}`,
    name,
    email,
    role: 'member',
    salt: credentials.salt,
    passwordHash: credentials.hash,
    createdAt: new Date().toISOString()
  };
  data.accounts.push(account);
  if (!writeData(data)) return res.status(500).json({ error: 'Could not save your account.' });

  const user = publicUser(account);
  return res.status(201).json({ user, token: createSession(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const ownerEmail = String(process.env.OWNER_EMAIL || '').trim().toLowerCase();
  if (ownerEmail && email === ownerEmail && process.env.OWNER_PASSWORD && password === process.env.OWNER_PASSWORD) {
    const user = { id: 'owner', name: process.env.OWNER_NAME || 'Gym Owner', email: ownerEmail, role: 'owner' };
    return res.json({ user, token: createSession(user) });
  }

  const account = readData().accounts.find(candidate => candidate.email === email);
  if (!account || !(await verifyPassword(password, account))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  const user = publicUser(account);
  return res.json({ user, token: createSession(user) });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: { id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role } });
});

app.get('/api/member/profile', authenticate, requireMember, (req, res) => {
  const data = readData();
  const account = getMemberAccount(data, req.user.sub);
  if (!account) return res.status(404).json({ error: 'Member account not found.' });

  const progress = account.progress || [];
  const currentStreak = getStreakCount(progress);
  res.json({
    user: publicUser(account),
    profile: account.profile || {},
    progress,
    currentStreak,
    longestStreak: Math.max(account.longestStreak || 0, currentStreak)
  });
});

app.patch('/api/member/profile', authenticate, requireMember, (req, res) => {
  const data = readData();
  const account = getMemberAccount(data, req.user.sub);
  if (!account) return res.status(404).json({ error: 'Member account not found.' });

  const { name, phone, goal, heightCm, startingWeightKg } = req.body;
  if (name !== undefined && (String(name).trim().length < 2 || String(name).trim().length > 80)) {
    return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
  }
  if (phone !== undefined && String(phone).length > 30) return res.status(400).json({ error: 'Phone number is too long.' });
  if (goal !== undefined && String(goal).length > 120) return res.status(400).json({ error: 'Fitness goal is too long.' });

  const profile = account.profile || {};
  if (name !== undefined) account.name = String(name).trim();
  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim() ? normalizeIndianMobile(phone) : '';
    if (String(phone).trim() && !normalizedPhone) return res.status(400).json({ error: 'Enter a valid Indian mobile number with 10 digits starting from 6 to 9.' });
    profile.phone = normalizedPhone;
  }
  if (goal !== undefined) profile.goal = String(goal).trim();
  if (heightCm !== undefined) {
    const value = Number(heightCm);
    if (heightCm !== '' && (!Number.isFinite(value) || value < 100 || value > 250)) return res.status(400).json({ error: 'Height must be between 100 and 250 cm.' });
    profile.heightCm = heightCm === '' ? '' : value;
  }
  if (startingWeightKg !== undefined) {
    const value = Number(startingWeightKg);
    if (startingWeightKg !== '' && (!Number.isFinite(value) || value < 20 || value > 400)) return res.status(400).json({ error: 'Starting weight must be between 20 and 400 kg.' });
    profile.startingWeightKg = startingWeightKg === '' ? '' : value;
  }
  account.profile = profile;
  account.updatedAt = new Date().toISOString();
  if (!writeData(data)) return res.status(500).json({ error: 'Could not save your profile.' });
  return res.json({ user: publicUser(account), profile });
});

app.post('/api/member/progress', authenticate, requireMember, handlePhotoUpload, (req, res) => {
  const data = readData();
  const account = getMemberAccount(data, req.user.sub);
  if (!account) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Member account not found.' });
  }
  if (!req.file) return res.status(400).json({ error: 'Choose a progress photo to record today.' });

  const date = new Date().toISOString().slice(0, 10);
  const progress = account.progress || [];
  if (progress.some(entry => entry.date === date)) {
    fs.unlinkSync(req.file.path);
    return res.status(409).json({ error: 'Today is already recorded. Come back tomorrow to continue your streak.' });
  }

  const weightValue = req.body.weightKg ? Number(req.body.weightKg) : null;
  if (weightValue !== null && (!Number.isFinite(weightValue) || weightValue < 20 || weightValue > 400)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Weight must be between 20 and 400 kg.' });
  }

  const entry = {
    id: `progress-${crypto.randomUUID()}`,
    date,
    filename: req.file.filename,
    note: String(req.body.note || '').trim().slice(0, 180),
    weightKg: weightValue,
    createdAt: new Date().toISOString()
  };
  account.progress = [entry, ...progress];
  account.longestStreak = Math.max(account.longestStreak || 0, getStreakCount(account.progress));
  if (!writeData(data)) {
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: 'Could not save your progress.' });
  }
  return res.status(201).json({ entry, currentStreak: getStreakCount(account.progress), longestStreak: account.longestStreak });
});

app.get('/api/member/progress/:id/photo', authenticate, requireMember, (req, res) => {
  const data = readData();
  const account = getMemberAccount(data, req.user.sub);
  const entry = account?.progress?.find(item => item.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Progress photo not found.' });
  res.setHeader('Cache-Control', 'private, no-store');
  return res.sendFile(entry.filename, { root: UPLOADS_PATH }, (error) => {
    if (error && !res.headersSent) res.status(error.statusCode || 500).json({ error: 'Could not retrieve progress photo.' });
  });
});

app.get('/api/owner/accounts', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const accounts = data.accounts
    .filter(account => account.role === 'member')
    .map(account => {
      const progress = (account.progress || []).map(({ id, date, note, weightKg, createdAt }) => ({ id, date, note, weightKg, createdAt }));
      const currentStreak = getStreakCount(progress);
      return {
        id: account.id,
        name: account.name,
        email: account.email,
        createdAt: account.createdAt,
        profile: account.profile || {},
        progress,
        currentStreak,
        longestStreak: Math.max(account.longestStreak || 0, currentStreak)
      };
    });
  res.json(accounts);
});

app.get('/api/owner/accounts/:accountId/progress/:progressId/photo', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const account = getMemberAccount(data, req.params.accountId);
  const entry = account?.progress?.find(item => item.id === req.params.progressId);
  if (!entry) return res.status(404).json({ error: 'Progress photo not found.' });
  res.setHeader('Cache-Control', 'private, no-store');
  return res.sendFile(entry.filename, { root: UPLOADS_PATH }, (error) => {
    if (error && !res.headersSent) res.status(error.statusCode || 500).json({ error: 'Could not retrieve progress photo.' });
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gym: 'Shehzad Fitness Zone (SFZ)',
    systemTime: new Date().toISOString(),
    version: '2.0.0-enterprise'
  });
});

// Analytics & Dashboard Stats
app.get('/api/stats', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const leadsCount = data.leads.length;
  const convertedLeads = data.leads.filter(l => l.status === 'enrolled').length;
  const calculatedConversion = leadsCount > 0 ? ((convertedLeads / leadsCount) * 100).toFixed(1) : 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const paymentsThisMonth = (data.payments || []).filter(payment => payment.paidAt?.startsWith(currentMonth));
  const monthlyRecordedFees = paymentsThisMonth.reduce((total, payment) => total + payment.amount, 0);
  const pendingFees = data.leads
    .filter(lead => lead.membershipRequest?.paymentStatus === 'pending')
    .reduce((total, lead) => total + lead.membershipRequest.amount, 0);

  res.json({
    ...data.stats,
    monthlyRevenue: monthlyRecordedFees,
    paymentsThisMonth: paymentsThisMonth.length,
    pendingFees,
    totalLeads: leadsCount,
    convertedLeads,
    calculatedConversion: Number(calculatedConversion),
    recentCheckins: data.recentCheckins || []
  });
});

// GET all Leads
app.get('/api/leads', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const { status, search } = req.query;

  let leads = data.leads || [];

  if (status && status !== 'all') {
    leads = leads.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.locality.toLowerCase().includes(q) ||
      l.goal.toLowerCase().includes(q)
    );
  }

  res.json(leads);
});

// POST new Lead (Join form / Free trial)
app.post('/api/leads', (req, res) => {
  const data = readData();
  const { name, phone, email, age, gender, locality, goal, planInterest, timePreference, notes, source, membershipRequest } = req.body;
  const normalizedPhone = normalizeIndianMobile(phone);

  if (!name || !normalizedPhone) {
    return res.status(400).json({ error: 'Enter a valid Indian mobile number with 10 digits starting from 6 to 9.' });
  }

  let feeRequest = null;
  if (membershipRequest) {
    const amount = Number(membershipRequest.amount);
    const billingCycle = membershipRequest.billingCycle;
    if (!['monthly', 'annual'].includes(billingCycle) || !Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      return res.status(400).json({ error: 'Membership plan or fee amount is invalid.' });
    }
    feeRequest = {
      billingCycle,
      amount: Math.round(amount),
      paymentStatus: 'pending',
      requestedAt: new Date().toISOString()
    };
  }

  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    phone: normalizedPhone,
    email: email || '',
    age: Number(age) || 24,
    gender: gender || 'male',
    locality: locality || 'Ludhiana Central',
    goal: goal || 'General Fitness & Strength',
    planInterest: planInterest || 'Gold Pro',
    membershipRequest: feeRequest,
    timePreference: timePreference || 'Evening',
    status: 'new',
    source: source || 'Web Platform',
    createdAt: new Date().toISOString(),
    notes: notes || 'Submitted via SFZ Web Portal'
  };

  data.leads.unshift(newLead);
  data.stats.totalMembers = (data.stats.totalMembers || 480);
  writeData(data);

  res.status(201).json({
    success: true,
    message: 'Inquiry received successfully! An SFZ Fitness Consultant will contact you within 15 minutes.',
    lead: newLead
  });
});

// PATCH Lead Status / Notes
app.patch('/api/leads/:id', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const { id } = req.params;
  const { status, notes } = req.body;

  const leadIndex = data.leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  if (status) data.leads[leadIndex].status = status;
  if (notes !== undefined) data.leads[leadIndex].notes = notes;
  data.leads[leadIndex].updatedAt = new Date().toISOString();

  writeData(data);
  res.json({ success: true, lead: data.leads[leadIndex] });
});

app.patch('/api/leads/:id/payment', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const lead = data.leads.find(item => item.id === req.params.id);
  if (!lead?.membershipRequest) return res.status(404).json({ error: 'Membership fee request not found.' });
  if (lead.membershipRequest.paymentStatus === 'paid') return res.status(409).json({ error: 'This membership fee has already been recorded as paid.' });

  const paymentMethod = String(req.body.paymentMethod || '').toLowerCase();
  if (!['cash', 'upi', 'card', 'bank transfer'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Choose cash, UPI, card, or bank transfer.' });
  }

  data.members = data.members || [];
  data.payments = data.payments || [];
  data.stats = data.stats || {};
  const existingMember = data.members.find(member => member.membershipLeadId === lead.id);
  let member = existingMember;
  if (!member) {
    const normalizedPhone = normalizeIndianMobile(lead.phone);
    if (!normalizedPhone) return res.status(400).json({ error: 'The lead has an invalid phone number. Correct it before recording payment.' });
    const joinDate = new Date();
    const expiryDate = new Date(joinDate);
    if (lead.membershipRequest.billingCycle === 'annual') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    else expiryDate.setMonth(expiryDate.getMonth() + 1);
    member = {
      id: `SFZ-${String(data.members.length + 1).padStart(3, '0')}`,
      membershipLeadId: lead.id,
      name: lead.name,
      phone: normalizedPhone,
      email: lead.email || '',
      plan: lead.planInterest,
      status: 'active',
      joinDate: joinDate.toISOString().slice(0, 10),
      expiryDate: expiryDate.toISOString().slice(0, 10),
      checkinCount: 0,
      lastCheckin: null,
      streak: 0,
      trainerAssigned: 'Head Coach Shehzad'
    };
    data.members.unshift(member);
    data.stats.totalMembers = (data.stats.totalMembers || 0) + 1;
  }

  const paidAt = new Date().toISOString();
  lead.membershipRequest.paymentStatus = 'paid';
  lead.membershipRequest.paymentMethod = paymentMethod;
  lead.membershipRequest.paidAt = paidAt;
  lead.membershipRequest.memberId = member.id;
  lead.status = 'enrolled';
  lead.updatedAt = paidAt;
  const payment = {
    id: `payment-${crypto.randomUUID()}`,
    leadId: lead.id,
    memberId: member.id,
    name: lead.name,
    phone: lead.phone,
    plan: lead.planInterest,
    billingCycle: lead.membershipRequest.billingCycle,
    amount: lead.membershipRequest.amount,
    method: paymentMethod,
    paidAt
  };
  data.payments.unshift(payment);
  if (!writeData(data)) return res.status(500).json({ error: 'Could not record the payment.' });
  return res.json({ success: true, lead, member, payment });
});

// DELETE Lead
app.delete('/api/leads/:id', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const { id } = req.params;

  const leadIndex = data.leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const removed = data.leads.splice(leadIndex, 1);
  writeData(data);

  res.json({ success: true, removed: removed[0] });
});

// Export Leads to CSV
app.get('/api/export/leads', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const leads = data.leads || [];

  const headers = ['ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Locality', 'Goal', 'Plan Interest', 'Status', 'Date'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${l.name}"`,
    `"${l.phone}"`,
    `"${l.email || ''}"`,
    l.age || '',
    `"${l.gender || ''}"`,
    `"${l.locality || ''}"`,
    `"${l.goal || ''}"`,
    `"${l.planInterest || ''}"`,
    `"${l.status}"`,
    `"${new Date(l.createdAt).toLocaleDateString()}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="SFZ_Leads_Report.csv"');
  res.send(csvContent);
});

// GET all Members
app.get('/api/members', authenticate, requireOwner, (req, res) => {
  const data = readData();
  res.json(data.members || []);
});

app.get('/api/payments', authenticate, requireOwner, (req, res) => {
  const data = readData();
  res.json(data.payments || []);
});

// POST new Member
app.post('/api/members', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const { name, phone, email, plan, trainerAssigned } = req.body;
  const normalizedPhone = normalizeIndianMobile(phone);

  if (!name || !normalizedPhone) {
    return res.status(400).json({ error: 'Enter a valid Indian mobile number with 10 digits starting from 6 to 9.' });
  }

  const newMember = {
    id: `SFZ-${String(data.members.length + 1).padStart(3, '0')}`,
    name,
    phone: normalizedPhone,
    email: email || '',
    plan: plan || 'Gold Pro',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkinCount: 1,
    lastCheckin: new Date().toISOString(),
    streak: 1,
    trainerAssigned: trainerAssigned || 'Head Coach Shehzad'
  };

  data.members.unshift(newMember);
  data.stats.totalMembers = (data.stats.totalMembers || 0) + 1;
  writeData(data);

  res.status(201).json({ success: true, member: newMember });
});

// POST Member Check-in
app.post('/api/members/:id/checkin', authenticate, requireOwner, (req, res) => {
  const data = readData();
  const { id } = req.params;

  const member = data.members.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  member.checkinCount = (member.checkinCount || 0) + 1;
  member.lastCheckin = new Date().toISOString();
  member.streak = (member.streak || 0) + 1;

  // Add to recent check-ins
  const checkinEntry = {
    id: `chk-${Date.now()}`,
    memberName: member.name,
    plan: member.plan,
    time: 'Just now',
    timestamp: new Date().toISOString()
  };

  if (!data.recentCheckins) data.recentCheckins = [];
  data.recentCheckins.unshift(checkinEntry);
  if (data.recentCheckins.length > 8) data.recentCheckins.pop();

  data.stats.activeToday = (data.stats.activeToday || 0) + 1;
  data.stats.currentFloorOccupancy = Math.min((data.stats.currentFloorOccupancy || 0) + 1, data.stats.maxFloorCapacity || 60);

  writeData(data);

  res.json({
    success: true,
    message: `Welcome ${member.name}! Check-in confirmed. Streak: ${member.streak} days 🔥`,
    member,
    currentOccupancy: data.stats.currentFloorOccupancy
  });
});

// GET Classes
app.get('/api/classes', (req, res) => {
  const data = readData();
  res.json(data.classes || []);
});

// POST Book Class Spot
app.post('/api/classes/:id/book', (req, res) => {
  const data = readData();
  const { id } = req.params;
  const { athleteName, athletePhone } = req.body;
  const normalizedPhone = normalizeIndianMobile(athletePhone);

  if (!normalizedPhone) {
    return res.status(400).json({ error: 'Enter a valid Indian mobile number with 10 digits starting from 6 to 9.' });
  }

  const gymClass = data.classes.find(c => c.id === id);
  if (!gymClass) {
    return res.status(404).json({ error: 'Class not found' });
  }

  if (gymClass.enrolled >= gymClass.capacity) {
    return res.status(400).json({ error: 'Class is fully booked!' });
  }

  gymClass.enrolled += 1;
  writeData(data);

  res.json({
    success: true,
    message: `Spot confirmed for ${athleteName || 'Athlete'} in ${gymClass.title}!`,
    class: gymClass
  });
});

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`⚡ SFZ Fitness API Server running at http://localhost:${PORT}`);
});
