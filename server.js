import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Since we are using ES modules, __dirname is not available directly.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// CORS middleware to allow requests from frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Static serving for uploaded files and ensuring directory exists
const uploadsRoot = path.join(__dirname, 'uploads');
const projectUploadsDir = path.join(uploadsRoot, 'projects');
if (!fs.existsSync(projectUploadsDir)) {
    fs.mkdirSync(projectUploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsRoot));

// Multer configuration for project images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, projectUploadsDir);
    },
    filename: function (req, file, cb) {
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const timestamp = Date.now();
        cb(null, `${timestamp}_${safeOriginal}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Unsupported file type'));
    }
});

// Upload endpoint (returns relative path)
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `/uploads/projects/${req.file.filename}`;
    res.status(201).json({ path: relativePath });
});

// ================= Project Requests (Quotes) =================
// Get all project requests
app.get('/api/project-requests', (req, res) => {
    const sql = 'SELECT * FROM project_requests ORDER BY id DESC';
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ================= Packages Server CRUD (Admin) =================
// Get all packages_server (ordered by display_order then id)
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

// Create a new packages_server item
app.post('/api/packages-server', (req, res) => {
    const {
        title,
        description,
        price,
        delivery_time,
        features,
        category,
        is_active,
        display_order,
        icon_html
    } = req.body;

    const sql = `INSERT INTO packages_server (
        title, description, price, delivery_time, features, category, is_active, display_order, icon_html
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        title || '',
        description || '',
        price ?? null,
        delivery_time || null,
        JSON.stringify(Array.isArray(features) ? features : []),
        category || null,
        is_active ? 1 : 0,
        display_order ?? null,
        icon_html || null
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'PackageServer created', id: this.lastID });
    });
});

// Update a packages_server item
app.put('/api/packages-server/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        price,
        delivery_time,
        features,
        category,
        is_active,
        display_order,
        icon_html
    } = req.body;

    const sql = `UPDATE packages_server SET 
        title = ?,
        description = ?,
        price = ?,
        delivery_time = ?,
        features = ?,
        category = ?,
        is_active = ?,
        display_order = ?,
        icon_html = ?
        WHERE id = ?`;

    const params = [
        title || '',
        description || '',
        price ?? null,
        delivery_time || null,
        JSON.stringify(Array.isArray(features) ? features : []),
        category || null,
        is_active ? 1 : 0,
        display_order ?? null,
        icon_html || null,
        parseInt(id)
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'PackageServer not found' });
        res.json({ message: 'PackageServer updated' });
    });
});

// Delete a packages_server item
app.delete('/api/packages-server/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM packages_server WHERE id = ?', [parseInt(id)], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'PackageServer not found' });
        res.json({ message: 'PackageServer deleted' });
    });
});

// ================= Packages CRUD (Admin) =================
// Get all packages (ordered by display_order then id)
app.get('/api/packages', (req, res) => {
    const sql = 'SELECT * FROM packages ORDER BY COALESCE(display_order, 999999), id';
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

// Create a new package
app.post('/api/packages', (req, res) => {
    const {
        title,
        description,
        price,
        delivery_time,
        features,
        category,
        is_active,
        display_order
    } = req.body;

    const sql = `INSERT INTO packages (
        title, description, price, delivery_time, features, category, is_active, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        title || '',
        description || '',
        price ?? null,
        delivery_time || null,
        JSON.stringify(Array.isArray(features) ? features : []),
        category || null,
        is_active ? 1 : 0,
        display_order ?? null
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Package created', id: this.lastID });
    });
});

// Update a package
app.put('/api/packages/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        price,
        delivery_time,
        features,
        category,
        is_active,
        display_order
    } = req.body;

    const sql = `UPDATE packages SET 
        title = ?,
        description = ?,
        price = ?,
        delivery_time = ?,
        features = ?,
        category = ?,
        is_active = ?,
        display_order = ?
        WHERE id = ?`;

    const params = [
        title || '',
        description || '',
        price ?? null,
        delivery_time || null,
        JSON.stringify(Array.isArray(features) ? features : []),
        category || null,
        is_active ? 1 : 0,
        display_order ?? null,
        parseInt(id)
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
        res.json({ message: 'Package updated' });
    });
});

// Delete a package
app.delete('/api/packages/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM packages WHERE id = ?', [parseInt(id)], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Package not found' });
        res.json({ message: 'Package deleted' });
    });
});

// Create a new project request
app.post('/api/project-requests', (req, res) => {
    const { name, company_name, requested_services, phone, email } = req.body;
    const sql = `INSERT INTO project_requests (name, company_name, requested_services, phone, email)
                 VALUES (?, ?, ?, ?, ?)`;
    const params = [
        name || '',
        company_name || '',
        typeof requested_services === 'string' ? requested_services : JSON.stringify(requested_services || []),
        phone || '',
        email || ''
    ];
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Request created', id: this.lastID });
    });
});

// Delete a project request
app.delete('/api/project-requests/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM project_requests WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted' });
    });
});

// Path to the database
const dbPath = path.resolve(__dirname, 'projects.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the projects database.');
        // Ensure project_requests table exists
        db.run(`CREATE TABLE IF NOT EXISTS project_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            company_name TEXT,
            requested_services TEXT,
            phone TEXT,
            email TEXT
        )`);
        // Ensure packages table exists per required schema
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
        // Ensure packages_server table exists
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

// API endpoint to get all projects
app.get('/api/projects', (req, res) => {
    const sql = 'SELECT * FROM projects';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// API endpoint to create a new project
app.post('/api/projects', (req, res) => {
    const {
        id,
        title,
        description,
        category,
        status,
        completion,
        value,
        duration,
        location,
        client,
        image,
        startDate,
        endDate
    } = req.body;

    const sql = `INSERT INTO projects (
        id, title, description, category, status, completion, 
        value, duration, location, client, image, startDate, endDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        id, title, description, category, status, completion,
        value, duration, location, client, image, startDate, endDate
    ];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ 
            message: 'Project created successfully',
            id: this.lastID 
        });
    });
});

// API endpoint to update a project
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        category,
        status,
        completion,
        value,
        duration,
        location,
        client,
        image,
        startDate,
        endDate
    } = req.body;

    const sql = `UPDATE projects SET 
        title = ?, description = ?, category = ?, status = ?, completion = ?,
        value = ?, duration = ?, location = ?, client = ?, image = ?,
        startDate = ?, endDate = ?
        WHERE id = ?`;

    const params = [
        title, description, category, status, completion,
        value, duration, location, client, image, startDate, endDate, id
    ];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json({ message: 'Project updated successfully' });
    });
});

// API endpoint to delete a project
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM projects WHERE id = ?';

    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json({ message: 'Project deleted successfully' });
    });
});

// API endpoint to get all services
app.get('/api/services', (req, res) => {
    const sql = 'SELECT * FROM services';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse JSON strings back into arrays
        const services = rows.map(service => ({
            ...service,
            features: JSON.parse(service.features || '[]'),
            benefits: JSON.parse(service.benefits || '[]'),
        }));
        res.json(services);
    });
});

// API endpoint to create a new service
app.post('/api/services', (req, res) => {
    const {
        title,
        description,
        short_description,
        icon,
        image,
        features,
        benefits,
        category,
        is_active,
        display_order
    } = req.body;

    const sql = `INSERT INTO services (
        title, description, short_description, icon, image,
        features, benefits, category, is_active, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        title, description, short_description, icon, image,
        JSON.stringify(features || []), JSON.stringify(benefits || []),
        category, is_active ? 1 : 0, display_order
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error creating service:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ 
            message: 'Service created successfully',
            id: this.lastID 
        });
    });
});

// API endpoint to update a service
app.put('/api/services/:id', (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        short_description,
        icon,
        image,
        features,
        benefits,
        category,
        is_active,
        display_order
    } = req.body;

    console.log('Updating service with ID:', id);
    console.log('Update data:', req.body);

    const sql = `UPDATE services SET 
        title = ?, description = ?, short_description = ?, icon = ?, image = ?,
        features = ?, benefits = ?, category = ?, is_active = ?, display_order = ?
        WHERE id = ?`;

    const params = [
        title, description, short_description, icon, image,
        JSON.stringify(features || []), JSON.stringify(benefits || []),
        category, is_active ? 1 : 0, display_order, parseInt(id)
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error updating service:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('No service found with ID:', id);
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        console.log('Service updated successfully, changes:', this.changes);
        res.json({ message: 'Service updated successfully' });
    });
});

// API endpoint to delete a service
app.delete('/api/services/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting service with ID:', id);
    
    const sql = 'DELETE FROM services WHERE id = ?';

    db.run(sql, [parseInt(id)], function(err) {
        if (err) {
            console.error('Error deleting service:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('No service found with ID:', id);
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        console.log('Service deleted successfully, changes:', this.changes);
        res.json({ message: 'Service deleted successfully' });
    });
});

// API endpoint to get all reviews/testimonials
app.get('/api/reviews', (req, res) => {
    const sql = 'SELECT * FROM reviews ORDER BY ordering ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Transform database rows to match frontend Testimonial interface
        const testimonials = rows.map(row => ({
            id: row.id,
            clientName: row.name,
            clientPosition: row.position,
            company: row.department,
            projectName: row.specialty,
            projectValue: row.experience, // Using experience as project value
            projectDuration: row.experience,
            testimonialText: row.bio,
            rating: 5, // Default rating since not in DB
            date: row.joinDate,
            clientImage: row.image,
            projectImage: row.image, // Using same image for both
            isActive: row.isActive === 1,
            order: row.ordering
        }));
        res.json(testimonials);
    });
});

// API endpoint to create a new review/testimonial
app.post('/api/reviews', (req, res) => {
    const {
        name,
        position,
        department,
        bio,
        email,
        phone,
        linkedin,
        image,
        experience,
        specialty,
        achievements,
        skills,
        isActive,
        ordering,
        joinDate
    } = req.body;

    const sql = `INSERT INTO reviews (
        id, name, position, department, bio, email, phone, linkedin,
        image, experience, specialty, achievements, skills, isActive, ordering, joinDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const id = Date.now().toString();
    const params = [
        id, name, position, department, bio, email, phone, linkedin,
        image, experience, specialty, achievements, skills,
        isActive ? 1 : 0, ordering, joinDate
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error creating review:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ 
            message: 'Review created successfully',
            id: id 
        });
    });
});

// API endpoint to update a review/testimonial
app.put('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const {
        name,
        position,
        department,
        bio,
        email,
        phone,
        linkedin,
        image,
        experience,
        specialty,
        achievements,
        skills,
        isActive,
        ordering,
        joinDate
    } = req.body;

    console.log('Updating review with ID:', id);
    console.log('Update data:', req.body);

    const sql = `UPDATE reviews SET 
        name = ?, position = ?, department = ?, bio = ?, email = ?, phone = ?, linkedin = ?,
        image = ?, experience = ?, specialty = ?, achievements = ?, skills = ?, isActive = ?, ordering = ?, joinDate = ?
        WHERE id = ?`;

    const params = [
        name, position, department, bio, email, phone, linkedin,
        image, experience, specialty, achievements, skills,
        isActive ? 1 : 0, ordering, joinDate, id
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error updating review:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('No review found with ID:', id);
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        console.log('Review updated successfully, changes:', this.changes);
        res.json({ message: 'Review updated successfully' });
    });
});

// API endpoint to delete a review/testimonial
app.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    console.log('Deleting review with ID:', id);
    
    const sql = 'DELETE FROM reviews WHERE id = ?';

    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Error deleting review:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log('No review found with ID:', id);
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        console.log('Review deleted successfully, changes:', this.changes);
        res.json({ message: 'Review deleted successfully' });
    });
});

// API endpoint to get FAQ categories
app.get('/api/faq-categories', (req, res) => {
    const sql = 'SELECT * FROM faq_categories ORDER BY key';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Add 'all' category at the beginning
        const categories = [
            { key: 'all', label: 'جميع الأسئلة' },
            ...rows
        ];
        res.json(categories);
    });
});

// API endpoint to get all FAQs
// API endpoint to get team members
app.get('/api/team-members', (req, res) => {
    // For admin panel, return all members; for public, filter by isActive
    const { activeOnly } = req.query;
    const sql = activeOnly === 'true' 
        ? 'SELECT * FROM team_members WHERE isActive = 1 ORDER BY "order" ASC'
        : 'SELECT * FROM team_members ORDER BY "order" ASC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const teamMembers = rows.map(member => ({
            ...member,
            achievements: JSON.parse(member.achievements || '[]'),
            skills: JSON.parse(member.skills || '[]'),
            isActive: Boolean(member.isActive)
        }));
        res.json(teamMembers);
    });
});

// API endpoint to create a new team member
app.post('/api/team-members', (req, res) => {
    const {
        name, position, department, bio, email, phone, linkedin, image,
        experience, specialty, achievements, skills, isActive, order, joinDate
    } = req.body;
    
    const sql = `INSERT INTO team_members (
        id, name, position, department, bio, email, phone, linkedin, image,
        experience, specialty, achievements, skills, isActive, "order", joinDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const id = Date.now().toString();
    const achievementsJson = JSON.stringify(achievements || []);
    const skillsJson = JSON.stringify(skills || []);
    
    db.run(sql, [
        id, name, position, department, bio, email, phone, linkedin, image,
        experience, specialty, achievementsJson, skillsJson, isActive ? 1 : 0, order || 1, joinDate
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            id, name, position, department, bio, email, phone, linkedin, image,
            experience, specialty, achievements: achievements || [], skills: skills || [],
            isActive: Boolean(isActive), order: order || 1, joinDate
        });
    });
});

// API endpoint to update a team member
app.put('/api/team-members/:id', (req, res) => {
    const { id } = req.params;
    const {
        name, position, department, bio, email, phone, linkedin, image,
        experience, specialty, achievements, skills, isActive, order, joinDate
    } = req.body;
    
    const sql = `UPDATE team_members SET 
        name = ?, position = ?, department = ?, bio = ?, email = ?, phone = ?, 
        linkedin = ?, image = ?, experience = ?, specialty = ?, achievements = ?, 
        skills = ?, isActive = ?, "order" = ?, joinDate = ?
        WHERE id = ?`;
    
    const achievementsJson = JSON.stringify(achievements || []);
    const skillsJson = JSON.stringify(skills || []);
    
    db.run(sql, [
        name, position, department, bio, email, phone, linkedin, image,
        experience, specialty, achievementsJson, skillsJson, isActive ? 1 : 0, order || 1, joinDate, id
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Team member not found' });
            return;
        }
        res.json({
            id, name, position, department, bio, email, phone, linkedin, image,
            experience, specialty, achievements: achievements || [], skills: skills || [],
            isActive: Boolean(isActive), order: order || 1, joinDate
        });
    });
});

// API endpoint to delete a team member
app.delete('/api/team-members/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM team_members WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Team member not found' });
            return;
        }
        res.json({ message: 'Team member deleted successfully' });
    });
});

// API endpoints for FAQ Categories
app.get('/api/faq-categories', (req, res) => {
    const sql = 'SELECT * FROM faq_categories ORDER BY key';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/faq-categories', (req, res) => {
    const { key, label } = req.body;
    const sql = 'INSERT INTO faq_categories (key, label) VALUES (?, ?)';
    db.run(sql, [key, label], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ key, label });
    });
});

app.put('/api/faq-categories/:key', (req, res) => {
    const { key } = req.params;
    const { label } = req.body;
    const sql = 'UPDATE faq_categories SET label = ? WHERE key = ?';
    db.run(sql, [label, key], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json({ key, label });
    });
});

app.delete('/api/faq-categories/:key', (req, res) => {
    const { key } = req.params;
    // First check if there are FAQs using this category
    db.get('SELECT COUNT(*) as count FROM faqs WHERE category = ?', [key], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row.count > 0) {
            res.status(400).json({ error: 'Cannot delete category with existing FAQs' });
            return;
        }
        
        const sql = 'DELETE FROM faq_categories WHERE key = ?';
        db.run(sql, [key], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Category not found' });
                return;
            }
            res.json({ message: 'Category deleted successfully' });
        });
    });
});

// API endpoints for FAQs
app.get('/api/faqs', (req, res) => {
    const { category } = req.query;
    let sql = 'SELECT * FROM faqs ORDER BY id';
    let params = [];
    
    if (category && category !== 'all') {
        sql = 'SELECT * FROM faqs WHERE category = ? ORDER BY id';
        params = [category];
    }
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/faqs', (req, res) => {
    const { category, question, answer } = req.body;
    const sql = 'INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)';
    db.run(sql, [category, question, answer], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, category, question, answer });
    });
});

app.put('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    const { category, question, answer } = req.body;
    const sql = 'UPDATE faqs SET category = ?, question = ?, answer = ? WHERE id = ?';
    db.run(sql, [category, question, answer, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'FAQ not found' });
            return;
        }
        res.json({ id: parseInt(id), category, question, answer });
    });
});

app.delete('/api/faqs/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM faqs WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'FAQ not found' });
            return;
        }
        res.json({ message: 'FAQ deleted successfully' });
    });
});

// Serve static files from the root directory
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
