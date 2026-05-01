const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'taskmanager.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

async function initDb() {
    if (db) return db;
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.run(schema);
    db.run('PRAGMA foreign_keys = ON');
    seedData();
    saveDb();
    return db;
}
function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDb() first.');
    return db;
}
function saveDb() {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, buffer);
}
setInterval(() => {
    if (db) saveDb();
}, 5000);
function seedData() {
    const result = db.exec("SELECT id FROM users WHERE email = 'admin@demo.com'");
    if (result.length > 0 && result[0].values.length > 0) return;
    console.log('🌱 Seeding demo data...');
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Demo Admin', 'admin@demo.com', hashedPassword]);
    db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Demo Member', 'member@demo.com', hashedPassword]);
    db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Alice Johnson', 'alice@demo.com', hashedPassword]);
    const adminId = db.exec("SELECT id FROM users WHERE email = 'admin@demo.com'")[0].values[0][0];
    const memberId = db.exec("SELECT id FROM users WHERE email = 'member@demo.com'")[0].values[0][0];
    const aliceId = db.exec("SELECT id FROM users WHERE email = 'alice@demo.com'")[0].values[0][0];
    db.run('INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
        ['Website Redesign', 'Complete overhaul of the company website with modern design and improved UX.', adminId]);
    db.run('INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
        ['Mobile App MVP', 'Build the minimum viable product for our cross-platform mobile application.', adminId]);
    const proj1Id = db.exec("SELECT id FROM projects WHERE name = 'Website Redesign'")[0].values[0][0];
    const proj2Id = db.exec("SELECT id FROM projects WHERE name = 'Mobile App MVP'")[0].values[0][0];
    db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [proj1Id, adminId, 'admin']);
    db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [proj1Id, memberId, 'member']);
    db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [proj1Id, aliceId, 'member']);
    db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [proj2Id, adminId, 'admin']);
    db.run('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)', [proj2Id, memberId, 'member']);
    const daysFromNow = (d) => {
        const date = new Date();
        date.setDate(date.getDate() + d);
        return date.toISOString();
    };
    const insertTask = (title, desc, status, priority, projId, assignee, creator, dueDays) => {
        db.run(
            'INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, desc, status, priority, projId, assignee, creator, daysFromNow(dueDays)]
        );
    };
    insertTask('Design new homepage mockup', 'Create Figma mockups for the new homepage layout with hero section.', 'done', 'high', proj1Id, memberId, adminId, -2);
    insertTask('Implement responsive navbar', 'Build a responsive navigation bar with mobile hamburger menu.', 'done', 'high', proj1Id, aliceId, adminId, -1);
    insertTask('Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment.', 'review', 'medium', proj1Id, adminId, adminId, 1);
    insertTask('Build contact form', 'Create a contact form with email validation and spam protection.', 'in_progress', 'medium', proj1Id, memberId, adminId, 3);
    insertTask('Write API documentation', 'Document all REST endpoints using Swagger/OpenAPI spec.', 'in_progress', 'low', proj1Id, aliceId, adminId, 5);
    insertTask('Optimize image loading', 'Implement lazy loading and WebP conversion for all images.', 'todo', 'medium', proj1Id, memberId, adminId, 7);
    insertTask('Add dark mode toggle', 'Implement a theme switcher with system preference detection.', 'todo', 'low', proj1Id, aliceId, adminId, 10);
    insertTask('Security audit', 'Run OWASP security scan and fix any critical vulnerabilities.', 'todo', 'critical', proj1Id, adminId, adminId, -1);
    insertTask('Set up React Native project', 'Initialize the project with Expo and configure navigation.', 'done', 'high', proj2Id, adminId, adminId, -5);
    insertTask('Design login screen', 'Create the authentication flow with social login options.', 'in_progress', 'high', proj2Id, memberId, adminId, 2);
    insertTask('Build user profile page', 'Implement the profile view with avatar upload and settings.', 'todo', 'medium', proj2Id, memberId, adminId, 8);
    insertTask('Push notification setup', 'Integrate Firebase Cloud Messaging for push notifications.', 'todo', 'high', proj2Id, adminId, adminId, 12);
    console.log('✅ Demo data seeded successfully!');
    console.log('   📧 Admin login:  admin@demo.com / password123');
    console.log('   📧 Member login: member@demo.com / password123');
}

module.exports = { initDb, getDb, saveDb };
