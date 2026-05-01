const { queryOne } = require('../db/helpers');

function requireProjectMember(req, res, next) {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }
    const project = queryOne('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
    }
    const membership = queryOne(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, req.user.id]
    );
    if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this project.' });
    }
    req.projectRole = membership.role;
    next();
}
function requireProjectAdmin(req, res, next) {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }
    const membership = queryOne(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [projectId, req.user.id]
    );
    if (!membership || membership.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required for this action.' });
    }
    req.projectRole = 'admin';
    next();
}
module.exports = { requireProjectMember, requireProjectAdmin };
