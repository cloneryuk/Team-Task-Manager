const express = require('express');
const { queryAll, queryOne, execute } = require('../db/helpers');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');
const { validateEmail, validateRole } = require('../utils/validators');

const router = express.Router({ mergeParams: true });
router.get('/', authenticate, requireProjectMember, (req, res) => {
    try {
        const members = queryAll(`
            SELECT u.id, u.name, u.email, pm.role, pm.joined_at
            FROM project_members pm JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = ? ORDER BY pm.role DESC, pm.joined_at ASC
        `, [req.params.id]);
        res.json({ members });
    } catch (err) {
        console.error('List members error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/', authenticate, requireProjectAdmin, (req, res) => {
    try {
        const { email, role } = req.body;
        const emailErr = validateEmail(email);
        if (emailErr) return res.status(400).json({ error: emailErr });
        const memberRole = role || 'member';
        const roleErr = validateRole(memberRole);
        if (roleErr) return res.status(400).json({ error: roleErr });

        const trimmedEmail = email.trim().toLowerCase();
        const user = queryOne('SELECT id, name, email FROM users WHERE email = ?', [trimmedEmail]);
        if (!user) return res.status(404).json({ error: 'No user found with that email address.' });

        const existing = queryOne(
            'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.id, user.id]
        );
        if (existing) return res.status(409).json({ error: 'User is already a member of this project.' });

        execute('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [req.params.id, user.id, memberRole]);

        res.status(201).json({ member: { id: user.id, name: user.name, email: user.email, role: memberRole } });
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/:userId', authenticate, requireProjectAdmin, (req, res) => {
    try {
        const { role } = req.body;
        const roleErr = validateRole(role);
        if (roleErr) return res.status(400).json({ error: roleErr });

        if (parseInt(req.params.userId) === req.user.id) {
            return res.status(400).json({ error: 'You cannot change your own role.' });
        }

        const membership = queryOne(
            'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.id, req.params.userId]
        );
        if (!membership) return res.status(404).json({ error: 'User is not a member of this project.' });

        execute('UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
            [role, req.params.id, parseInt(req.params.userId)]);
        res.json({ message: 'Member role updated successfully.' });
    } catch (err) {
        console.error('Update member role error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.delete('/:userId', authenticate, requireProjectAdmin, (req, res) => {
    try {
        if (parseInt(req.params.userId) === req.user.id) {
            return res.status(400).json({ error: 'You cannot remove yourself from the project.' });
        }
        const membership = queryOne(
            'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.id, req.params.userId]
        );
        if (!membership) return res.status(404).json({ error: 'User is not a member of this project.' });

        execute('DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
            [req.params.id, parseInt(req.params.userId)]);
        execute('UPDATE tasks SET assigned_to = NULL WHERE project_id = ? AND assigned_to = ?',
            [req.params.id, parseInt(req.params.userId)]);
        res.json({ message: 'Member removed successfully.' });
    } catch (err) {
        console.error('Remove member error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
