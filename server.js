import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { PrismaClient } from './generated/prisma/index.js';

const app = express();
const port = 4000;
const dataDir = join(process.cwd(), 'data');
const uploadsDir = join(process.cwd(), 'uploads');
const upload = multer({ dest: uploadsDir });
const filePaths = {
  users: join(dataDir, 'users.json'),
  loginHistory: join(dataDir, 'login-history.json'),
  sessions: join(dataDir, 'sessions.json'),
};

const prisma = new PrismaClient();
let prismaConnected = false;

try {
  await prisma.$connect();
  prismaConnected = true;
  console.log('Prisma connected to database.');
} catch (err) {
  console.error('Prisma failed to connect. Vendor APIs will still run if only login is needed.');
  console.error(err);
}

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

const ensureDataFiles = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });
  for (const path of Object.values(filePaths)) {
    try {
      await fs.access(path);
    } catch (err) {
      const initialValue = path === filePaths.users ? [] : [];
      await fs.writeFile(path, JSON.stringify(initialValue, null, 2), 'utf8');
    }
  }
};

const readJson = async (path, defaultValue) => {
  try {
    const raw = await fs.readFile(path, 'utf8');
    return JSON.parse(raw || 'null') ?? defaultValue;
  } catch (err) {
    return defaultValue;
  }
};

const writeJson = async (path, data) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const recordLoginAttempt = async ({ email, status, role, message }) => {
  const loginHistory = await readJson(filePaths.loginHistory, []);
  const newEntry = {
    email,
    status,
    role,
    message,
    timestamp: new Date().toISOString(),
  };
  await writeJson(filePaths.loginHistory, [newEntry, ...loginHistory]);
};

const createSession = async (userEmail) => {
  const sessions = await readJson(filePaths.sessions, []);
  const sessionId = randomUUID();
  const user = await findUserByEmail(userEmail);
  sessions.push({ sessionId, email: userEmail, role: user.role, createdAt: new Date().toISOString() });
  await writeJson(filePaths.sessions, sessions);
  return sessionId;
};

const findUserByEmail = async (email) => {
  const users = await readJson(filePaths.users, []);
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

app.get('/api/session', async (req, res) => {
  const { sessionId } = req.cookies;
  if (!sessionId) {
    return res.json({ user: null });
  }
  const sessions = await readJson(filePaths.sessions, []);
  const session = sessions.find((record) => record.sessionId === sessionId);
  if (!session) {
    return res.json({ user: null });
  }
  const user = await findUserByEmail(session.email);
  if (!user) {
    return res.json({ user: null });
  }
  const { password, ...userData } = user;
  res.json({ user: userData });
});

app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, role, country, password, confirmPassword, extra } = req.body;
  if (!firstName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'That email is already registered.' });
  }

  const users = await readJson(filePaths.users, []);
  const newUser = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() ?? '',
    role: role || 'Officer',
    country: country?.trim() ?? '',
    password,
    extra: extra?.trim() ?? '',
  };
  await writeJson(filePaths.users, [newUser, ...users]);
  res.json({ message: 'Registration successful. You can now login.' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email) || !password) {
    const message = 'Please enter a valid email and password.';
    await recordLoginAttempt({ email, status: 'failed', role: 'unknown', message });
    return res.status(400).json({ error: message });
  }
  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    const message = 'Invalid email or password.';
    await recordLoginAttempt({ email, status: 'failed', role: user?.role || 'unknown', message });
    return res.status(401).json({ error: message });
  }
  const sessionId = await createSession(user.email);
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  const { password: _, ...userData } = user;
  await recordLoginAttempt({ email: user.email, status: 'success', role: user.role, message: 'Login successful' });
  res.json({ user: userData });
});

app.post('/api/logout', async (req, res) => {
  const { sessionId } = req.cookies;
  if (sessionId) {
    const sessions = await readJson(filePaths.sessions, []);
    const filtered = sessions.filter((session) => session.sessionId !== sessionId);
    await writeJson(filePaths.sessions, filtered);
    res.clearCookie('sessionId');
  }
  res.json({ message: 'Logged out' });
});

app.post('/api/forgot', async (req, res) => {
  const { email, phone } = req.body;
  if (!validateEmail(email) || !phone || !phone.trim()) {
    return res.status(400).json({ error: 'Please enter a valid email and phone number.' });
  }

  const user = await findUserByEmail(email);
  if (!user || user.phone !== phone.trim()) {
    return res.status(400).json({ error: 'The provided email and phone do not match our records.' });
  }

  res.json({ message: 'Account verified. Enter a new password to reset your account.' });
});

app.post('/api/reset-password', async (req, res) => {
  const { email, phone, password, confirmPassword } = req.body;
  if (!validateEmail(email) || !phone || !phone.trim() || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Please provide email, phone, and matching password fields.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const users = await readJson(filePaths.users, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.phone !== phone.trim()) {
    return res.status(400).json({ error: 'The provided email and phone do not match our records.' });
  }

  const updatedUsers = users.map((u) => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return { ...u, password };
    }
    return u;
  });
  await writeJson(filePaths.users, updatedUsers);
  res.json({ message: 'Password reset successfully. You can now login.' });
});

// Vendors API - uses Prisma to persist vendors
app.get('/api/vendors', async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. Vendor APIs are not available right now.' });
  }
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { created_at: 'desc' } });
    res.json({ vendors });
  } catch (err) {
    console.error('Error fetching vendors', err);
    res.status(500).json({ error: 'Unable to fetch vendors' });
  }
});

app.post('/api/vendors', async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. Vendor APIs are not available right now.' });
  }
  const { company_name, gst_number, category, status, contact_name, contact_email, contact_phone } = req.body;
  if (!company_name || !gst_number || !category || !status) {
    return res.status(400).json({ error: 'Missing required vendor fields.' });
  }

  try {
    const vendor = await prisma.vendor.create({
      data: {
        company_name: company_name.trim(),
        gst_number: gst_number.trim(),
        category: category.trim(),
        status: status.trim(),
        contact_name: contact_name?.trim() ?? null,
        contact_email: contact_email?.trim() ?? null,
        contact_phone: contact_phone?.trim() ?? null,
      },
    });
    res.json({ vendor });
  } catch (err) {
    console.error('Error creating vendor', err);
    // Handle unique constraint on gst_number
    if (err && err.code === 'P2002') {
      return res.status(400).json({ error: 'A vendor with this GST number already exists.' });
    }
    res.status(500).json({ error: 'Unable to create vendor' });
  }
});

app.get('/api/rfqs', async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. RFQ APIs are not available right now.' });
  }

  try {
    const rfqs = await prisma.rFQ.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        line_items: true,
        assigned_vendors: { include: { vendor: true } },
        attachments: true,
      },
    });
    res.json({ rfqs });
  } catch (err) {
    console.error('Error fetching RFQs', err);
    res.status(500).json({ error: 'Unable to fetch RFQs' });
  }
});

app.post('/api/rfqs', upload.array('attachments', 8), async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. RFQ APIs are not available right now.' });
  }

  const safeParseJson = (value, fallback) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (err) {
        return fallback;
      }
    }
    return value ?? fallback;
  };

  const { title, category, deadline, description } = req.body;
  const line_items = safeParseJson(req.body.line_items, []);
  const vendor_ids = safeParseJson(req.body.vendor_ids, []);

  if (!title || !category || !deadline || !Array.isArray(line_items) || line_items.length === 0) {
    return res.status(400).json({ error: 'Missing required RFQ fields.' });
  }

  const validLineItems = line_items.filter((item) => item?.item && item?.unit && Number(item.quantity) > 0);
  if (validLineItems.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one valid line item.' });
  }

  try {
    const rfq = await prisma.rFQ.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        deadline: new Date(deadline),
        description: description?.trim() ?? '',
        line_items: {
          create: validLineItems.map((item) => ({
            item: item.item.trim(),
            quantity: Number(item.quantity) || 1,
            unit: item.unit.trim() || 'NOS',
          })),
        },
        assigned_vendors: {
          create: (Array.isArray(vendor_ids) ? vendor_ids : []).map((vendorId) => ({
            vendor: { connect: { id: Number(vendorId) } },
          })),
        },
        attachments: {
          create: (req.files || []).map((file) => ({
            file_name: file.originalname,
            file_url: `/uploads/${file.filename}`,
            file_type: file.mimetype,
            file_size: file.size,
          })),
        },
      },
      include: {
        line_items: true,
        assigned_vendors: { include: { vendor: true } },
        attachments: true,
      },
    });
    res.json({ rfq });
  } catch (err) {
    console.error('Error creating RFQ', err);
    res.status(500).json({ error: 'Unable to create RFQ' });
  }
});

app.get('/api/quotations', async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. Quotation APIs are not available right now.' });
  }

  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        rfq: true,
        vendor: true,
      },
    });
    res.json({ quotations });
  } catch (err) {
    console.error('Error fetching quotations', err);
    res.status(500).json({ error: 'Unable to fetch quotations' });
  }
});

app.post('/api/quotations', async (req, res) => {
  if (!prismaConnected) {
    return res.status(503).json({ error: 'Database unavailable. Quotation APIs are not available right now.' });
  }

  const { rfq_id, vendor_id, total_amount, delivery_days, status } = req.body;
  if (!rfq_id || !vendor_id || !total_amount || !delivery_days || !status) {
    return res.status(400).json({ error: 'Missing required quotation fields.' });
  }

  try {
    const quotation = await prisma.quotation.create({
      data: {
        rfq: { connect: { id: Number(rfq_id) } },
        vendor: { connect: { id: Number(vendor_id) } },
        total_amount: Number(total_amount),
        delivery_days: Number(delivery_days),
        status: status.trim(),
      },
      include: {
        rfq: true,
        vendor: true,
      },
    });
    res.json({ quotation });
  } catch (err) {
    console.error('Error creating quotation', err);
    res.status(500).json({ error: 'Unable to create quotation' });
  }
});

await ensureDataFiles();

const server = app.listen(port, () => {
  console.log(`VendorBridge backend running on http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing server or change the port, then try again.`);
    process.exit(1);
  }
  throw err;
});

const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      if (prismaConnected) {
        await prisma.$disconnect();
        console.log('Prisma disconnected.');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
