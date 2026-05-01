const express = require('express');
const { queryAll, queryOne } = require('../db/helpers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
    try {
        const userId = req.user.id;

        const projectRows = queryAll(
            'SELECT project_id FROM project_members WHERE user_id = ?', [userId]
        );
        const projectIds = projectRows.map(r => r.project_id);

        if (projectIds.length === 0) {
            return res.json({
                stats: { total: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 },
                recentTasks: [], myTasks: [], tasksPerUser: [], projectCount: 0
            });
        }

        const ph = projectIds.map(() => '?').join(',');

        const statusCounts = queryAll(
            `SELECT status, COUNT(*) as count FROM tasks WHERE project_id IN (${ph}) GROUP BY status`,
            projectIds
        );

        const stats = { total: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 };
        statusCounts.forEach(row => { stats[row.status] = row.count; stats.total += row.count; });

        const overdueResult = queryOne(
            `SELECT COUNT(*) as count FROM tasks WHERE project_id IN (${ph}) AND due_date < datetime('now') AND status != 'done'`,
            projectIds
        );
        stats.overdue = overdueResult ? overdueResult.count : 0;

        const recentTasks = queryAll(
            `SELECT t.*, p.name as project_name, u1.name as assigned_to_name, u2.name as created_by_name
             FROM tasks t JOIN projects p ON p.id = t.project_id LEFT JOIN users u1 ON u1.id = t.assigned_to
             JOIN users u2 ON u2.id = t.created_by WHERE t.project_id IN (${ph}) ORDER BY t.updated_at DESC LIMIT 10`,
            projectIds
        );

        const myTasks = queryAll(
            `SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON p.id = t.project_id
             WHERE t.assigned_to = ? AND t.status != 'done'
             ORDER BY CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, t.due_date ASC LIMIT 10`,
            [userId]
        );

        const tasksPerUser = queryAll(
            `SELECT u.id, u.name, COUNT(t.id) as task_count,
                    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_count,
                    SUM(CASE WHEN t.status != 'done' THEN 1 ELSE 0 END) as active_count
             FROM tasks t
             JOIN users u ON u.id = t.assigned_to
             WHERE t.project_id IN (${ph})
             GROUP BY u.id, u.name
             ORDER BY task_count DESC`,
            projectIds
        );

        res.json({ stats, recentTasks, myTasks, tasksPerUser, projectCount: projectIds.length });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
