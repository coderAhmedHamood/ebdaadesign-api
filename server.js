import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES modules: derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || process.env.SERVER_PORT) || 3000;

// Parse JSON
app.use(express.json());

// CORS (frontend runs on 3001 during dev)
app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Static uploads (configurable via UPLOADS_DIR; defaults to backend/uploads)
const uploadsRoot = path.resolve(__dirname, process.env.UPLOADS_DIR || 'uploads');
const projectUploadsDir = path.join(uploadsRoot, 'projects');
if (!fs.existsSync(projectUploadsDir)) fs.mkdirSync(projectUploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsRoot));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, projectUploadsDir),
  filename: (req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}_${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true); else cb(new Error('Unsupported file type'));
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(201).json({ path: `/uploads/projects/${req.file.filename}` });
});

// SQLite DB path configurable via DB_PATH (relative or absolute)
const dbPath = path.resolve(__dirname, process.env.DB_PATH || 'projects.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log(`Connected to SQLite at ${dbPath}`);
    db.run(`CREATE TABLE IF NOT EXISTS project_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      company_name TEXT,
      requested_services TEXT,
      phone TEXT,
      email TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      price REAL,
      delivery_time TEXT,
      features TEXT,
      category TEXT,
      is_active BOOLEAN,
      display_order INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS packages_server (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      price REAL,
      delivery_time TEXT,
      features TEXT,
      category TEXT,
      is_active BOOLEAN,
      display_order INTEGER,
      icon_html TEXT
    )`);
  }
});

// ==== Routes (copied from original) ====
// Project requests
app.get('/api/project-requests', (req, res) => {
  db.all('SELECT * FROM project_requests ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/project-requests', (req, res) => {
  const { name, company_name, requested_services, phone, email } = req.body;
  const sql = `INSERT INTO project_requests (name, company_name, requested_services, phone, email) VALUES (?, ?, ?, ?, ?)`;
  const params = [
    name || '',
    company_name || '',
    typeof requested_services === 'string' ? requested_services : JSON.stringify(requested_services || []),
    phone || '',
    email || ''
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Request created', id: this.lastID });
  });
});

app.delete('/api/project-requests/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM project_requests WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  });
});

// Packages server
app.get('/api/packages-server', (req, res) => {
  const sql = 'SELECT * FROM packages_server ORDER BY COALESCE(display_order, 999999), id';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const list = rows.map(r => ({
      ...r,
      features: (() => { try { return JSON.parse(r.features || '[]'); } catch { return []; } })(),
      is_active: r.is_active === 1 || r.is_active === true
    }));
    res.json(list);
  });
});

app.post('/api/packages-server', (req, res) => {
  const { title, description, price, delivery_time, features, category, is_active, display_order, icon_html } = req.body;
  const sql = `INSERT INTO packages_server (title, description, price, delivery_time, features, category, is_active, display_order, icon_html) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title || '', description || '', price ?? null, delivery_time || null, JSON.stringify(Array.isArray(features) ? features : []), category || null, is_active ? 1 : 0, display_order ?? null, icon_html || null];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'PackageServer created', id: this.lastID });
  });
});

app.put('/api/packages-server/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, delivery_time, features, category, is_active, display_order, icon_html } = req.body;
  const sql = `UPDATE packages_server SET title = ?, description = ?, price = ?, delivery_time = ?, features = ?, category = ?, is_active = ?, display_order = ?, icon_html = ? WHERE id = ?`;
  const params = [title || '', description || '', price ?? null, delivery_time || null, JSON.stringify(Array.isArray(features) ? features : []), category || null, is_active ? 1 : 0, display_order ?? null, icon_html || null, parseInt(id)];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'PackageServer not found' });
    res.json({ message: 'PackageServer updated' });
  });
});

app.delete('/api/packages-server/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM packages_server WHERE id = ?', [parseInt(id)], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'PackageServer not found' });
    res.json({ message: 'PackageServer deleted' });
  });
});

// Packages
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM packages ORDER BY COALESCE(display_order, 999999), id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const list = rows.map(r => ({ ...r, features: (() => { try { return JSON.parse(r.features || '[]'); } catch { return []; } })(), is_active: r.is_active === 1 || r.is_active === true }));
    res.json(list);
  });
});

app.post('/api/packages', (req, res) => {
  const { title, description, price, delivery_time, features, category, is_active, display_order } = req.body;
  const sql = `INSERT INTO packages (title, description, price, delivery_time, features, category, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title || '', description || '', price ?? null, delivery_time || null, JSON.stringify(Array.isArray(features) ? features : []), category || null, is_active ? 1 : 0, display_order ?? null];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Package created', id: this.lastID });
  });
});

app.put('/api/packages/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, delivery_time, features, category, is_active, display_order } = req.body;
  const sql = `UPDATE packages SET title = ?, description = ?, price = ?, delivery_time = ?, features = ?, category = ?, is_active = ?, display_order = ? WHERE id = ?`;
  const params = [title || '', description || '', price ?? null, delivery_time || null, JSON.stringify(Array.isArray(features) ? features : []), category || null, is_active ? 1 : 0, display_order ?? null, parseInt(id)];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package updated' });
  });
});

app.delete('/api/packages/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM packages WHERE id = ?', [parseInt(id)], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted' });
  });
});

// Projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/projects', (req, res) => {
  const { id, title, description, category, status, completion, value, duration, location, client, image, startDate, endDate } = req.body;
  const sql = `INSERT INTO projects (id, title, description, category, status, completion, value, duration, location, client, image, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [id, title, description, category, status, completion, value, duration, location, client, image, startDate, endDate], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Project created successfully', id: this.lastID });
  });
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, status, completion, value, duration, location, client, image, startDate, endDate } = req.body;
  const sql = `UPDATE projects SET title = ?, description = ?, category = ?, status = ?, completion = ?, value = ?, duration = ?, location = ?, client = ?, image = ?, startDate = ?, endDate = ? WHERE id = ?`;
  const params = [title, description, category, status, completion, value, duration, location, client, image, startDate, endDate, id];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project updated successfully' });
  });
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  });
});

// Services
app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const services = rows.map(s => ({ ...s, features: JSON.parse(s.features || '[]'), benefits: JSON.parse(s.benefits || '[]') }));
    res.json(services);
  });
});

app.post('/api/services', (req, res) => {
  const { title, description, short_description, icon, image, features, benefits, category, is_active, display_order } = req.body;
  const sql = `INSERT INTO services (title, description, short_description, icon, image, features, benefits, category, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, description, short_description, icon, image, JSON.stringify(features || []), JSON.stringify(benefits || []), category, is_active ? 1 : 0, display_order];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Service created successfully', id: this.lastID });
  });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, short_description, icon, image, features, benefits, category, is_active, display_order } = req.body;
  const sql = `UPDATE services SET title = ?, description = ?, short_description = ?, icon = ?, image = ?, features = ?, benefits = ?, category = ?, is_active = ?, display_order = ? WHERE id = ?`;
  const params = [title, description, short_description, icon, image, JSON.stringify(features || []), JSON.stringify(benefits || []), category, is_active ? 1 : 0, display_order, parseInt(id)];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service updated successfully' });
  });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM services WHERE id = ?', [parseInt(id)], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  });
});

// Reviews
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY ordering ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const testimonials = rows.map(row => ({
      id: row.id,
      clientName: row.name,
      clientPosition: row.position,
      company: row.department,
      projectName: row.specialty,
      projectValue: row.experience,
      projectDuration: row.experience,
      testimonialText: row.bio,
      rating: 5,
      date: row.joinDate,
      clientImage: row.image,
      projectImage: row.image,
      isActive: row.isActive === 1,
      order: row.ordering
    }));
    res.json(testimonials);
  });
});

app.post('/api/reviews', (req, res) => {
  const { name, position, department, bio, email, phone, linkedin, image, experience, specialty, achievements, skills, isActive, ordering, joinDate } = req.body;
  const id = Date.now().toString();
  const sql = `INSERT INTO reviews (id, name, position, department, bio, email, phone, linkedin, image, experience, specialty, achievements, skills, isActive, ordering, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, name, position, department, bio, email, phone, linkedin, image, experience, specialty, achievements, skills, isActive ? 1 : 0, ordering, joinDate];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Review created successfully', id });
  });
});

app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, department, bio, email, phone, linkedin, image, experience, specialty, achievements, skills, isActive, ordering, joinDate } = req.body;
  const sql = `UPDATE reviews SET name = ?, position = ?, department = ?, bio = ?, email = ?, phone = ?, linkedin = ?, image = ?, experience = ?, specialty = ?, achievements = ?, skills = ?, isActive = ?, ordering = ?, joinDate = ? WHERE id = ?`;
  const params = [name, position, department, bio, email, phone, linkedin, image, experience, specialty, achievements, skills, isActive ? 1 : 0, ordering, joinDate, id];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review updated successfully' });
  });
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM reviews WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  });
});

// FAQ categories
app.get('/api/faq-categories', (req, res) => {
  db.all('SELECT * FROM faq_categories ORDER BY key', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const categories = [{ key: 'all', label: 'جميع الأسئلة' }, ...rows];
    res.json(categories);
  });
});

app.post('/api/faq-categories', (req, res) => {
  const { key, label } = req.body;
  db.run('INSERT INTO faq_categories (key, label) VALUES (?, ?)', [key, label], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ key, label });
  });
});

app.put('/api/faq-categories/:key', (req, res) => {
  const { key } = req.params;
  const { label } = req.body;
  db.run('UPDATE faq_categories SET label = ? WHERE key = ?', [label, key], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ key, label });
  });
});

app.delete('/api/faq-categories/:key', (req, res) => {
  const { key } = req.params;
  db.get('SELECT COUNT(*) as count FROM faqs WHERE category = ?', [key], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0) return res.status(400).json({ error: 'Cannot delete category with existing FAQs' });
    db.run('DELETE FROM faq_categories WHERE key = ?', [key], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Category not found' });
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

// FAQs
app.get('/api/faqs', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM faqs ORDER BY id';
  let params = [];
  if (category && category !== 'all') { sql = 'SELECT * FROM faqs WHERE category = ? ORDER BY id'; params = [category]; }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/faqs', (req, res) => {
  const { category, question, answer } = req.body;
  db.run('INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)', [category, question, answer], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, category, question, answer });
  });
});

app.put('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  const { category, question, answer } = req.body;
  db.run('UPDATE faqs SET category = ?, question = ?, answer = ? WHERE id = ?', [category, question, answer, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ id: parseInt(id), category, question, answer });
  });
});

app.delete('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM faqs WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ message: 'FAQ deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
