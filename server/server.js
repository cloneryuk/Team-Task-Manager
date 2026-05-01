require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const memberRoutes = require('./routes/members');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/members', memberRoutes);
app.use('/api/projects/:id/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

const path = require('path');
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}
async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`\n🚀 Team Task Manager API running on http://localhost:${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
}
start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
