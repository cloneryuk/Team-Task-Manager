const express = require('express');
const bcrypt = require('bcryptjs');
const { queryOne, execute } = require('../db/helpers');
const { authenticate, generateToken } = require('../middleware/auth');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');
const router = express.Router();
router.post('/signup', (req, res) => {
    try {
        const { name, email, password } = req.body;
        const nameErr = validateName(name);
        if (nameErr) return res.status(400).json({ error: nameErr });
        const emailErr = validateEmail(email);
        if (emailErr) return res.status(400).json({ error: emailErr });
        const passErr = validatePassword(password);
        if (passErr) return res.status(400).json({ error: passErr });
        const trimmedEmail = email.trim().toLowerCase();
        const existing = queryOne('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        const passwordHash = bcrypt.hashSync(password, 10);
        const result = execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name.trim(), trimmedEmail, passwordHash]
        );
        const token = generateToken(result.lastId);

        res.status(201).json({
            token,
            user: { id: result.lastId, name: name.trim(), email: trimmedEmail }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const trimmedEmail = email.trim().toLowerCase();
        const user = queryOne('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = generateToken(user.id);
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});
module.exports = router;
