const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: "Admin access required" });
        }
    });
}

function authenticateStudent(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user && (req.user.role === 'student' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ error: "Student access required" });
        }
    });
}

function authenticateParent(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user && (req.user.role === 'parent' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ error: "Parent access required" });
        }
    });
}

module.exports = { 
    authenticateToken, 
    authenticateAdmin,
    authenticateStudent,
    authenticateParent
}; 