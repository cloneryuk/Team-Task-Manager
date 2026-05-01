const jwt = require('jsonwebtoken');
const { queryOne } = require('../db/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'team-task-manager-secret-key-2024';

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = queryOne('SELECT id, name, email FROM users WHERE id = ?', [decoded.userId]);

        if (!user) {
            return res.status(401).json({ error: 'User not found. Token may be invalid.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token.' });
    }
}

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authenticate, generateToken, JWT_SECRET };
