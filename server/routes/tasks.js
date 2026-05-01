const express = require('express');
const { queryAll, queryOne, execute } = require('../db/helpers');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');
const { validateTaskTitle, validateStatus, validatePriority } = require('../utils/validators');

const router = express.Router({ mergeParams: true });

const TASK_SELECT = `
    SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name
    FROM tasks t LEFT JOIN users u1 ON u1.id = t.assigned_to
    JOIN users u2 ON u2.id = t.created_by
`;
router.get('/', authenticate, requireProjectMember, (req, res) => {
    try {
        const { status, priority, assigned_to } = req.query;
        let query = `${TASK_SELECT} WHERE t.project_id = ?`;
        const params = [req.params.id];

        if (status) { query += ' AND t.status = ?'; params.push(status); }
        if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
        if (assigned_to) { query += ' AND t.assigned_to = ?'; params.push(parseInt(assigned_to)); }

        query += ' ORDER BY t.created_at DESC';
        const tasks = queryAll(query, params);
        res.json({ tasks });
    } catch (err) {
        console.error('List tasks error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.post('/', authenticate, requireProjectMember, (req, res) => {
    try {
        const { title, description, status, priority, assigned_to, due_date } = req.body;

        const titleErr = validateTaskTitle(title);
        if (titleErr) return res.status(400).json({ error: titleErr });

        const taskStatus = status || 'todo';
        const statusErr = validateStatus(taskStatus);
        if (statusErr) return res.status(400).json({ error: statusErr });

        const taskPriority = priority || 'medium';
        const priorityErr = validatePriority(taskPriority);
        if (priorityErr) return res.status(400).json({ error: priorityErr });

        if (assigned_to) {
            const isMember = queryOne(
                'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
                [req.params.id, assigned_to]
            );
            if (!isMember) return res.status(400).json({ error: 'Assigned user is not a member of this project.' });
        }

        const result = execute(
            'INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title.trim(), (description || '').trim(), taskStatus, taskPriority, req.params.id, assigned_to || null, req.user.id, due_date || null]
        );

        const task = queryOne(`${TASK_SELECT} WHERE t.id = ?`, [result.lastId]);
        res.status(201).json({ task });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/:taskId', authenticate, (req, res) => {
    try {
        const task = queryOne(`${TASK_SELECT} WHERE t.id = ?`, [req.params.taskId]);
        if (!task) return res.status(404).json({ error: 'Task not found.' });

        const membership = queryOne(
            'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
            [task.project_id, req.user.id]
        );
        if (!membership) return res.status(403).json({ error: 'You are not a member of this project.' });

        res.json({ task });
    } catch (err) {
        console.error('Get task error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/:taskId', authenticate, (req, res) => {
    try {
        const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
        if (!task) return res.status(404).json({ error: 'Task not found.' });

        const membership = queryOne(
            'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
            [task.project_id, req.user.id]
        );
        if (!membership) return res.status(403).json({ error: 'You are not a member of this project.' });

        const isAdmin = membership.role === 'admin';
        const isAssignee = task.assigned_to === req.user.id;

        const { title, description, status, priority, assigned_to, due_date } = req.body;

        if (!isAdmin && !isAssignee) {
            return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
        }

        if (assigned_to !== undefined && assigned_to !== task.assigned_to && !isAdmin) {
            return res.status(403).json({ error: 'Only project admins can reassign tasks.' });
        }

        if (title) { const e = validateTaskTitle(title); if (e) return res.status(400).json({ error: e }); }
        if (status) { const e = validateStatus(status); if (e) return res.status(400).json({ error: e }); }
        if (priority) { const e = validatePriority(priority); if (e) return res.status(400).json({ error: e }); }

        if (assigned_to) {
            const isMember = queryOne(
                'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
                [task.project_id, assigned_to]
            );
            if (!isMember) return res.status(400).json({ error: 'Assigned user is not a member of this project.' });
        }

        execute(
            `UPDATE tasks SET title=?, description=?, status=?, priority=?, assigned_to=?, due_date=?, updated_at=datetime('now') WHERE id=?`,
            [
                title ? title.trim() : task.title,
                description !== undefined ? description.trim() : task.description,
                status || task.status,
                priority || task.priority,
                assigned_to !== undefined ? (assigned_to || null) : task.assigned_to,
                due_date !== undefined ? (due_date || null) : task.due_date,
                req.params.taskId
            ]
        );

        const updated = queryOne(`${TASK_SELECT} WHERE t.id = ?`, [req.params.taskId]);
        res.json({ task: updated });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
router.delete('/:taskId', authenticate, (req, res) => {
    try {
        const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
        if (!task) return res.status(404).json({ error: 'Task not found.' });

        const membership = queryOne(
            'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
            [task.project_id, req.user.id]
        );
        if (!membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only project admins can delete tasks.' });
        }

        execute('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
        res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
