const { getDb, saveDb } = require('./database');

function queryAll(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

function queryOne(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    let row = null;
    if (stmt.step()) {
        row = stmt.getAsObject();
    }
    stmt.free();
    return row;
}

function execute(sql, params = []) {
    const db = getDb();
    db.run(sql, params);
    const changes = db.getRowsModified();
    const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
    const lastId = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : 0;
    saveDb();
    return { changes, lastId };
}

module.exports = { queryAll, queryOne, execute };
