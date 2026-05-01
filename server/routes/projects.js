const express = require('express');
const { queryAll, queryOne, execute } = require('../db/helpers');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');
const { validateProjectName } = require('../utils/validators');
const router = express.Router();
router.get('/', authenticate, (req, res) => {
    try {
        const projects = queryAll(`
            SELECT p.*, pm.role as user_role, u.name as creator_name,
                   (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
                   (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
            FROM projects p
            JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
            JOIN users u ON u.id = p.created_by
            ORDER BY p.created_at DESC
        `, [req.user.id]);

        res.json({ projects });
    } catch (err) {
        console.error('List projects error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.post('/', authenticate, (req, res) => {
    try {
        const { name, description } = req.body;
        const nameErr = validateProjectName(name);
        if (nameErr) return res.status(400).json({ error: nameErr });

        const result = execute(
            'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
            [name.trim(), (description || '').trim(), req.user.id]
        );

        execute(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [result.lastId, req.user.id, 'admin']
        );

        const project = queryOne('SELECT * FROM projects WHERE id = ?', [result.lastId]);
        res.status(201).json({ project: { ...project, user_role: 'admin' } });
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.get('/:id', authenticate, requireProjectMember, (req, res) => {
    try {
        const project = queryOne(`
            SELECT p.*, u.name as creator_name
            FROM projects p JOIN users u ON u.id = p.created_by WHERE p.id = ?
        `, [req.params.id]);

        res.json({ project: { ...project, user_role: req.projectRole } });
    } catch (err) {
        console.error('Get project error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.put('/:id', authenticate, requireProjectAdmin, (req, res) => {
    try {
        const { name, description } = req.body;
        if (name) {
            const nameErr = validateProjectName(name);
            if (nameErr) return res.status(400).json({ error: nameErr });
        }
        const current = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        execute('UPDATE projects SET name = ?, description = ? WHERE id = ?', [
            name ? name.trim() : current.name,
            description !== undefined ? description.trim() : current.description,
            req.params.id
        ]);
        const updated = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        res.json({ project: { ...updated, user_role: 'admin' } });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.delete('/:id', authenticate, requireProjectAdmin, (req, res) => {
    try {
        execute('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
        execute('DELETE FROM project_members WHERE project_id = ?', [req.params.id]);
        execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
