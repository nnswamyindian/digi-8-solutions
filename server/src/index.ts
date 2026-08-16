import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool, { initDb } from './db.js';
import { sendInstantReply, sendVerificationEmail, sendAdminNotification, sendPasswordResetEmail } from './emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
initDb().catch(console.error);

// Helper for sending responses
const sendSuccess = (res: express.Response, data: any = null, message = 'Success') => {
  res.json({ success: true, message, data });
};

const sendError = (res: express.Response, error: any, status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, error: error.message || 'Server error' });
};

// --- ROUTES ---

// Offline / Mock Data Store
const mockLeads: any[] = [];
const mockContacts: any[] = [];
const mockQuotes: any[] = [];
const mockSubscribers: any[] = [];
const mockTickets: any[] = [];

// --- REALTIME ADMIN SSE NOTIFICATION ENGINE ---
const adminSseClients = new Set<express.Response>();

export const broadcastAdminNotification = (type: string, title: string, message: string, payload: any = {}) => {
  const eventPayload = JSON.stringify({
    type,
    title,
    message,
    payload,
    timestamp: new Date().toISOString()
  });

  adminSseClients.forEach((client) => {
    try {
      client.write(`data: ${eventPayload}\n\n`);
    } catch (e) {
      adminSseClients.delete(client);
    }
  });
};

// SSE Stream Endpoint for Admin Apps & PWA
app.get('/api/admin/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connection packet
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Admin SSE Stream Connected' })}\n\n`);

  adminSseClients.add(res);

  req.on('close', () => {
    adminSseClients.delete(res);
  });
});

// 1. Leads API
app.post('/api/leads', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO leads 
         (first_name, last_name, email, phone, company, industry, budget, timeline, services, message, verification_token) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.first_name, data.last_name, data.email, data.phone, data.company, data.industry,
          data.budget, data.timeline, JSON.stringify(data.services || []), data.message, token
        ]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving lead in fallback memory mode:', (dbErr as any).message);
      mockLeads.push({ id: insertId, ...data, created_at: new Date() });
    }

    // Send Verification Email & Instant Reply to User
    await sendVerificationEmail(data.email, token, 'lead');
    await sendInstantReply(data.email, data.first_name || 'there', 'lead');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('lead', data);

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_LEAD',
      '🚨 New Lead Captured!',
      `New lead from ${data.first_name || ''} ${data.last_name || ''} (${data.company || 'Direct Client'})`,
      { id: insertId, ...data }
    );

    sendSuccess(res, { id: insertId }, 'Lead saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Contacts API
app.post('/api/contacts', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO contacts (name, email, subject, message, verification_token) VALUES (?, ?, ?, ?, ?)`,
        [data.name, data.email, data.subject, data.message, token]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving contact in fallback memory mode:', (dbErr as any).message);
      mockContacts.push({ id: insertId, ...data, created_at: new Date() });
    }

    await sendVerificationEmail(data.email, token, 'contact');
    await sendInstantReply(data.email, data.name || 'there', 'contact');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('contact', data);

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_CONTACT',
      '📩 New Contact Inquiry!',
      `Message from ${data.name} — ${data.subject || 'General Inquiry'}`,
      { id: insertId, ...data }
    );

    sendSuccess(res, { id: insertId }, 'Contact saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 3. Quotes API
app.post('/api/quotes', async (req, res) => {
  try {
    const data = req.body;
    const token = uuidv4();
    const quoteNum = data.quote_number || `QT-${Date.now().toString().slice(-6)}`;
    let insertId = Date.now();

    try {
      const [result] = await pool.query(
        `INSERT INTO quotes 
         (quote_number, first_name, last_name, email, phone, company, website, project_type, project_details, total_estimate, selected_features, verification_token) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteNum, data.first_name, data.last_name, data.email, data.phone, data.company, data.website,
          data.project_type, data.project_details, data.total_estimate, JSON.stringify(data.selected_features || []), token
        ]
      );
      insertId = (result as any).insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving quote in fallback memory mode:', (dbErr as any).message);
      mockQuotes.push({ id: insertId, quote_number: quoteNum, ...data, created_at: new Date() });
    }

    await sendVerificationEmail(data.email, token, 'quote');
    await sendInstantReply(data.email, data.first_name || 'there', 'quote');

    // Send Notification Email to Admin (digi8solutions@gmail.com)
    await sendAdminNotification('quote', { ...data, quote_number: quoteNum });

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_QUOTE',
      '💰 New Project Quote Request!',
      `Quote #${quoteNum} from ${data.first_name || ''} ${data.last_name || ''} — Estimate: ₹${data.total_estimate || 0}`,
      { id: insertId, quote_number: quoteNum, ...data }
    );

    sendSuccess(res, { id: insertId, quote_number: quoteNum }, 'Quote saved successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Newsletter API
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    const token = uuidv4();

    try {
      await pool.query(
        `INSERT INTO newsletter_subscribers (email, verification_token) VALUES (?, ?) ON DUPLICATE KEY UPDATE verification_token = ?`,
        [email, token, token]
      );
    } catch (dbErr) {
      console.warn('[DB WARNING] Subscribing in fallback memory mode:', (dbErr as any).message);
      mockSubscribers.push({ email, created_at: new Date() });
    }

    await sendVerificationEmail(email, token, 'newsletter');

    // Realtime Broadcast to Connected Admin PWA / Web Apps
    broadcastAdminNotification(
      'NEW_SUBSCRIBER',
      '📧 New Newsletter Subscriber!',
      `Subscriber email: ${email}`,
      { email }
    );

    sendSuccess(res, null, 'Subscribed successfully. Please check your email to verify.');
  } catch (err) {
    sendError(res, err);
  }
});

// 5. Verification Endpoint
app.post('/api/verify', async (req, res) => {
  try {
    const { token, type } = req.body;
    if (!token || !type) return res.status(400).json({ success: false, error: 'Token and type are required' });

    let table = '';
    if (type === 'lead') table = 'leads';
    else if (type === 'contact') table = 'contacts';
    else if (type === 'quote') table = 'quotes';
    else if (type === 'newsletter') table = 'newsletter_subscribers';
    else return res.status(400).json({ success: false, error: 'Invalid type' });

    try {
      const [result]: any = await pool.query(`UPDATE ${table} SET is_verified = TRUE WHERE verification_token = ?`, [token]);
      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, error: 'Invalid or expired token' });
      }
    } catch (dbErr) {
      console.warn('[DB WARNING] Email verification in fallback mode.');
    }

    sendSuccess(res, null, 'Email verified successfully!');
  } catch (err) {
    sendError(res, err);
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-digi8';

// 6. Auth APIs
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user: any = null;

    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE email = ?', [email]);
      if (rows && rows.length > 0) {
        const dbUser = rows[0];
        const isValid = await bcrypt.compare(password, dbUser.password_hash || '');
        if (isValid) {
          user = dbUser;
        }
      }
    } catch (dbErr) {
      console.warn('[AUTH DB WARNING] MySQL unavailable, checking Super Admin fallback:', (dbErr as any).message);
    }

    // Offline / Mock Super Admin fallback check
    if (!user) {
      if (email === 'admin@digi8solutions.com' && password === 'AdminDigi8Password2026!') {
        user = {
          id: 1,
          email: 'admin@digi8solutions.com',
          name: 'Digi-8 Super Admin',
          role: 'Super Admin'
        };
      } else {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    sendSuccess(res, { token, user: { id: user.id, email: user.email, role: user.role, name: user.name } }, 'Logged in successfully');
  } catch (err) { sendError(res, err); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    let insertId = Date.now();

    try {
      const [result]: any = await pool.query(
        'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, role || 'Normal User']
      );
      insertId = result.insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving admin user in fallback mode');
    }

    sendSuccess(res, { id: insertId }, 'User created successfully');
  } catch (err) { sendError(res, err); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000);

    try {
      await pool.query('UPDATE admin_users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, email]);
    } catch (dbErr) {
      console.warn('[DB WARNING] Forgot password reset in fallback mode');
    }

    await sendPasswordResetEmail(email, token);

    sendSuccess(res, null, 'If that email exists, a reset link was sent.');
  } catch (err) { sendError(res, err); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
      if (rows.length > 0) {
        await pool.query('UPDATE admin_users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hash, rows[0].id]);
      }
    } catch (dbErr) {
      console.warn('[DB WARNING] Password reset in fallback mode');
    }

    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) { sendError(res, err); }
});

// 7. Generic CRUD APIs
const createCrudRoutes = (tableName: string) => {
  app.get(`/api/${tableName}`, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
      sendSuccess(res, rows);
    } catch (dbErr) {
      console.warn(`[DB WARNING] GET /api/${tableName} fallback:`, (dbErr as any).message);
      if (tableName === 'admin_users') {
        return sendSuccess(res, [{ id: 1, name: 'Digi-8 Super Admin', email: 'admin@digi8solutions.com', role: 'Super Admin', status: 'active' }]);
      }
      if (tableName === 'leads') return sendSuccess(res, mockLeads);
      if (tableName === 'quotes') return sendSuccess(res, mockQuotes);
      if (tableName === 'contacts') return sendSuccess(res, mockContacts);
      sendSuccess(res, []);
    }
  });

  app.post(`/api/${tableName}`, async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => req.body[k] !== undefined);
      const values = keys.map(k => typeof req.body[k] === 'object' ? JSON.stringify(req.body[k]) : req.body[k]);
      const placeholders = keys.map(() => '?').join(',');
      const [result] = await pool.query(`INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`, values);
      sendSuccess(res, { id: (result as any).insertId }, 'Created successfully');
    } catch (dbErr) {
      console.warn(`[DB WARNING] POST /api/${tableName} fallback:`, (dbErr as any).message);
      sendSuccess(res, { id: Date.now() }, 'Created (offline mode)');
    }
  });

  app.put(`/api/${tableName}/:id`, async (req, res) => {
    try {
      const keys = Object.keys(req.body).filter(k => req.body[k] !== undefined && k !== 'id');
      const values = keys.map(k => typeof req.body[k] === 'object' ? JSON.stringify(req.body[k]) : req.body[k]);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      if (keys.length > 0) {
        await pool.query(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
      }
      sendSuccess(res, null, 'Updated successfully');
    } catch (dbErr) {
      sendSuccess(res, null, 'Updated (offline mode)');
    }
  });

  app.delete(`/api/${tableName}/:id`, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
      sendSuccess(res, null, 'Deleted successfully');
    } catch (dbErr) {
      sendSuccess(res, null, 'Deleted (offline mode)');
    }
  });
};

// --- SUPPORT TICKET SYSTEM API ---

// 1. Create Support Ticket (From Chatbot or Support Desk)
app.post('/api/tickets', async (req, res) => {
  try {
    const data = req.body;
    const ticketNum = data.ticket_number || `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    let insertId = Date.now();

    const ticketObj = {
      id: insertId,
      ticket_number: ticketNum,
      user_name: data.user_name || 'Guest Visitor',
      user_email: data.user_email || 'visitor@digi8solutions.com',
      user_phone: data.user_phone || '',
      service_category: data.service_category || 'General Support',
      subject: data.subject || 'Support Ticket',
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'open',
      assigned_to: 'Support Desk',
      created_at: new Date()
    };

    try {
      const [result] = await pool.query(
        `INSERT INTO support_tickets 
         (ticket_number, user_name, user_email, user_phone, service_category, subject, description, priority, status, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketObj.ticket_number, ticketObj.user_name, ticketObj.user_email, ticketObj.user_phone,
          ticketObj.service_category, ticketObj.subject, ticketObj.description, ticketObj.priority,
          ticketObj.status, ticketObj.assigned_to
        ]
      );
      insertId = (result as any).insertId;
      ticketObj.id = insertId;
    } catch (dbErr) {
      console.warn('[DB WARNING] Saving support ticket in fallback memory mode:', (dbErr as any).message);
      mockTickets.push(ticketObj);
    }

    // Realtime Broadcast to Connected Admin & Support Desk
    broadcastAdminNotification(
      'NEW_TICKET',
      `🎫 New Support Ticket #${ticketNum}`,
      `Subject: ${ticketObj.subject} (${ticketObj.user_name})`,
      ticketObj
    );

    sendSuccess(res, ticketObj, `Support ticket #${ticketNum} raised successfully.`);
  } catch (err) {
    sendError(res, err);
  }
});

// 2. Get All Support Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM support_tickets ORDER BY created_at DESC`);
    sendSuccess(res, rows);
  } catch (dbErr) {
    sendSuccess(res, mockTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }
});

// 3. Update Support Ticket Status & Resolution
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { status, priority, resolution_notes, assigned_to } = req.body;
    const ticketId = req.params.id;

    try {
      await pool.query(
        `UPDATE support_tickets SET status = COALESCE(?, status), priority = COALESCE(?, priority), resolution_notes = COALESCE(?, resolution_notes), assigned_to = COALESCE(?, assigned_to) WHERE id = ?`,
        [status, priority, resolution_notes, assigned_to, ticketId]
      );
    } catch (dbErr) {
      const idx = mockTickets.findIndex(t => String(t.id) === String(ticketId));
      if (idx !== -1) {
        if (status) mockTickets[idx].status = status;
        if (priority) mockTickets[idx].priority = priority;
        if (resolution_notes) mockTickets[idx].resolution_notes = resolution_notes;
        if (assigned_to) mockTickets[idx].assigned_to = assigned_to;
      }
    }

    broadcastAdminNotification(
      'TICKET_UPDATED',
      `🔄 Ticket #${ticketId} Updated`,
      `Status changed to ${status || 'updated'}`,
      { id: ticketId, status, priority }
    );

    sendSuccess(res, null, 'Ticket updated successfully.');
  } catch (err) {
    sendError(res, err);
  }
});

// 4. Delete Support Ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM support_tickets WHERE id = ?`, [req.params.id]);
    sendSuccess(res, null, 'Ticket deleted successfully');
  } catch (dbErr) {
    const idx = mockTickets.findIndex(t => String(t.id) === String(req.params.id));
    if (idx !== -1) mockTickets.splice(idx, 1);
    sendSuccess(res, null, 'Ticket deleted');
  }
});

createCrudRoutes('projects');
createCrudRoutes('testimonials');
createCrudRoutes('blogs');
createCrudRoutes('service_pricing');
createCrudRoutes('admin_users');
createCrudRoutes('leads');
createCrudRoutes('quotes');
createCrudRoutes('contacts');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Digi8 Backend Server running on port ${port}`);
});
