const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

// Register new student
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'student'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(400).json({ error: err.message });
                }
                
                const token = jwt.sign({ userId: this.lastID, role: 'student' }, JWT_SECRET);
                res.json({ token, userId: this.lastID, role: 'student' });
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register new parent
router.post('/register-parent', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert parent user
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'parent'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(400).json({ error: err.message });
                }
                
                const token = jwt.sign({ userId: this.lastID, role: 'parent' }, JWT_SECRET);
                res.json({ token, userId: this.lastID, role: 'parent' });
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

// Password reset request
router.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;
    
    if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username and new password are required' });
    }
    
    try {
        // Check if user exists
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username], (err) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({ message: 'Password reset successful' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin route to get all users
router.get('/users', authenticateToken, (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    db.all('SELECT id, username, role, created_at, last_login FROM users', [], (err, users) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ users });
    });
});

// Admin route to update user role
router.put('/users/:userId/role', authenticateToken, (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
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
router.delete('/users/:userId', authenticateToken, (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
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
    const { username, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create admin user
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(400).json({ error: err.message });
                }
                const token = jwt.sign({ userId: this.lastID, role: 'admin' }, JWT_SECRET);
                res.json({ token, userId: this.lastID, role: 'admin' });
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

// Get all students (for admin and parents)
router.get('/students', authenticateToken, (req, res) => {
    // Only admin and parents can access this
    if (req.user.role !== 'admin' && req.user.role !== 'parent') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    db.all('SELECT id, username, created_at, last_login FROM users WHERE role = ?', ['student'], (err, students) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ students });
    });
});

// Get all parents (for admin)
router.get('/parents', authenticateToken, (req, res) => {
    // Only admin can access this
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    db.all('SELECT id, username, created_at, last_login FROM users WHERE role = ?', ['parent'], (err, parents) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ parents });
    });
});

// Assign a child to a parent (admin only)
router.post('/assign-child', authenticateToken, (req, res) => {
    // Only admin can assign children to parents
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { parentId, childId } = req.body;
    
    if (!parentId || !childId) {
        return res.status(400).json({ error: 'Parent ID and Child ID are required' });
    }
    
    // Verify parent is a parent
    db.get('SELECT * FROM users WHERE id = ? AND role = ?', [parentId, 'parent'], (err, parent) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!parent) {
            return res.status(404).json({ error: 'Parent not found' });
        }
        
        // Verify child is a student
        db.get('SELECT * FROM users WHERE id = ? AND role = ?', [childId, 'student'], (err, child) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!child) {
                return res.status(404).json({ error: 'Student not found' });
            }
            
            // Create the relationship
            db.run('INSERT INTO parent_child (parent_id, child_id) VALUES (?, ?)', 
                [parentId, childId], 
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            return res.status(400).json({ error: 'This parent-child relationship already exists' });
                        }
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({ 
                        message: 'Child assigned to parent successfully',
                        relationshipId: this.lastID
                    });
                }
            );
        });
    });
});

// Remove a child from a parent (admin only)
router.delete('/remove-child', authenticateToken, (req, res) => {
    // Only admin can remove children from parents
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { parentId, childId } = req.body;
    
    if (!parentId || !childId) {
        return res.status(400).json({ error: 'Parent ID and Child ID are required' });
    }
    
    db.run('DELETE FROM parent_child WHERE parent_id = ? AND child_id = ?', 
        [parentId, childId], 
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Relationship not found' });
            }
            res.json({ message: 'Child removed from parent successfully' });
        }
    );
});

// Get children for a parent
router.get('/my-children', authenticateToken, (req, res) => {
    // Only parents can access their children
    if (req.user.role !== 'parent') {
        return res.status(403).json({ error: 'Parent access required' });
    }
    
    const parentId = req.user.userId;
    
    db.all(`
        SELECT u.id, u.username, u.created_at, u.last_login
        FROM users u
        JOIN parent_child pc ON u.id = pc.child_id
        WHERE pc.parent_id = ?
    `, [parentId], (err, children) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ children });
    });
});

// Get all parent-child relationships (admin only)
router.get('/parent-child-relationships', authenticateToken, (req, res) => {
    // Only admin can view all relationships
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    
    db.all(`
        SELECT pc.id, pc.parent_id, pc.child_id, pc.created_at,
               p.username as parent_username, c.username as child_username
        FROM parent_child pc
        JOIN users p ON pc.parent_id = p.id
        JOIN users c ON pc.child_id = c.id
    `, [], (err, relationships) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ relationships });
    });
});

module.exports = router; 