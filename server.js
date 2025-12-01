const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Database paths
const DB_PATH = '/data/invoices.db';
const BACKUP_DIR = '/backups';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initialize SQLite database
const db = new Database(DB_PATH, { verbose: console.log });

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

console.log('✅ Database initialized');

// Backup function
function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}.db`);

        // Copy database file
        fs.copyFileSync(DB_PATH, backupPath);

        console.log(`✅ Backup created: ${backupPath}`);

        // Keep only last 7 backups
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_'))
            .sort()
            .reverse();

        if (backups.length > 7) {
            backups.slice(7).forEach(oldBackup => {
                fs.unlinkSync(path.join(BACKUP_DIR, oldBackup));
                console.log(`🗑️ Deleted old backup: ${oldBackup}`);
            });
        }

        return backupPath;
    } catch (error) {
        console.error('Error creating backup:', error);
        throw error;
    }
}

// Schedule automatic backups every 24 hours
setInterval(() => {
    console.log('⏰ Running scheduled backup...');
    createBackup();
}, 24 * 60 * 60 * 1000); // 24 hours

// Create initial backup on startup
setTimeout(() => {
    console.log('📦 Creating initial backup...');
    createBackup();
}, 5000); // 5 seconds after startup

// GET all invoices
app.get('/api/invoices', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
        const invoices = rows.map(row => JSON.parse(row.data));
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// GET single invoice
app.get('/api/invoices/:id', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
        if (!row) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(JSON.parse(row.data));
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});

// POST create invoice
app.post('/api/invoices', (req, res) => {
    try {
        const invoice = req.body;
        const now = new Date().toISOString();

        const stmt = db.prepare(`
      INSERT INTO invoices (id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);

        stmt.run(
            invoice.id,
            JSON.stringify(invoice),
            invoice.createdAt || now,
            now
        );

        res.status(201).json({ success: true, id: invoice.id });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// PUT update invoice
app.put('/api/invoices/:id', (req, res) => {
    try {
        const invoice = req.body;
        const now = new Date().toISOString();

        const stmt = db.prepare(`
      UPDATE invoices
      SET data = ?, updated_at = ?
      WHERE id = ?
    `);

        const result = stmt.run(JSON.stringify(invoice), now, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});

// DELETE invoice
app.delete('/api/invoices/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
        const result = stmt.run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});

// GET list all backups
app.get('/api/backups', (req, res) => {
    try {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('backup_'))
            .map(filename => {
                const stats = fs.statSync(path.join(BACKUP_DIR, filename));
                return {
                    filename,
                    size: stats.size,
                    created: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.created) - new Date(a.created));

        res.json(backups);
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ error: 'Failed to list backups' });
    }
});

// POST create manual backup
app.post('/api/backup', (req, res) => {
    try {
        const backupPath = createBackup();
        res.json({ success: true, backup: path.basename(backupPath) });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// POST restore from backup
app.post('/api/restore', (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename || !filename.startsWith('backup_')) {
            return res.status(400).json({ error: 'Invalid backup filename' });
        }

        const backupPath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: 'Backup not found' });
        }

        // Close current database connection
        db.close();

        // Replace current database with backup
        fs.copyFileSync(backupPath, DB_PATH);

        console.log(`✅ Database restored from: ${filename}`);

        // Restart the process to reload database
        process.exit(0); // Docker will restart the container automatically

    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ error: 'Failed to restore backup' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        backupCount: fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup_')).length
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Invoice API server running on port ${PORT}`);
    console.log(`📁 Database location: ${DB_PATH}`);
    console.log(`💾 Backup location: ${BACKUP_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing database...');
    db.close();
    process.exit(0);
});
