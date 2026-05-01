
function validateEmail(email) {
    if (!email || typeof email !== 'string') return 'Email is required.';
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
    return null;
}
function validatePassword(password) {
    if (!password || typeof password !== 'string') return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    if (password.length > 128) return 'Password must be at most 128 characters long.';
    return null;
}
function validateName(name) {
    if (!name || typeof name !== 'string') return 'Name is required.';
    const trimmed = name.trim();
    if (trimmed.length < 2) return 'Name must be at least 2 characters long.';
    if (trimmed.length > 100) return 'Name must be at most 100 characters long.';
    return null;
}
function validateProjectName(name) {
    if (!name || typeof name !== 'string') return 'Project name is required.';
    const trimmed = name.trim();
    if (trimmed.length < 2) return 'Project name must be at least 2 characters.';
    if (trimmed.length > 200) return 'Project name must be at most 200 characters.';
    return null;
}
function validateTaskTitle(title) {
    if (!title || typeof title !== 'string') return 'Task title is required.';
    const trimmed = title.trim();
    if (trimmed.length < 2) return 'Task title must be at least 2 characters.';
    if (trimmed.length > 300) return 'Task title must be at most 300 characters.';
    return null;
}
function validateStatus(status) {
    const valid = ['todo', 'in_progress', 'review', 'done'];
    if (status && !valid.includes(status)) {
        return `Status must be one of: ${valid.join(', ')}`;
    }
    return null;
}
function validatePriority(priority) {
    const valid = ['low', 'medium', 'high', 'critical'];
    if (priority && !valid.includes(priority)) {
        return `Priority must be one of: ${valid.join(', ')}`;
    }
    return null;
}
function validateRole(role) {
    const valid = ['admin', 'member'];
    if (!role || !valid.includes(role)) {
        return `Role must be one of: ${valid.join(', ')}`;
    }
    return null;
}
module.exports = {
    validateEmail,
    validatePassword,
    validateName,
    validateProjectName,
    validateTaskTitle,
    validateStatus,
    validatePriority,
    validateRole
};