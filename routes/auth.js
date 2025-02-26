const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

// Register new user
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(400).json({ error: err.message });
                }
                
                const token = jwt.sign({ userId: this.lastID, role: 'user' }, JWT_SECRET);
                res.json({ token, userId: this.lastID });
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
        res.json({ token, userId: user.id, role: user.role });
    });
});

// Admin route to get all users
router.get('/users', authenticateAdmin, (req, res) => {
    db.all('SELECT id, username, email, role, created_at, last_login FROM users', [], (err, users) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ users });
    });
});

// Admin route to update user role
router.put('/users/:userId/role', authenticateAdmin, (req, res) => {
    const { role } = req.body;
    const { userId } = req.params;
    
    db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'User role updated successfully' });
    });
});

// Admin route to delete user
router.delete('/users/:userId', authenticateAdmin, (req, res) => {
    const { userId } = req.params;
    
    db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

// First-time admin setup (remove this route after creating your admin account)
router.post('/setup-admin', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        // Check if any admin exists
        db.get('SELECT * FROM users WHERE role = ?', ['admin'], async (err, existingAdmin) => {
            if (existingAdmin) {
                return res.status(400).json({ error: 'Admin already exists' });
            }
            
            // Create admin user
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, email, 'admin'],
                function(err) {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    const token = jwt.sign({ userId: this.lastID, role: 'admin' }, JWT_SECRET);
                    res.json({ token, userId: this.lastID, role: 'admin' });
                });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update the verify endpoint with logging
router.get('/verify', authenticateToken, (req, res) => {
    console.log('Token verification request received');
    console.log('User data:', req.user);
    
    // Send back user information along with validation
    res.json({ 
        valid: true,
        userId: req.user.userId,
        role: req.user.role
    });
});

module.exports = router; 