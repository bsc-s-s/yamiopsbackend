import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'yamiops.db';

let db = null;

class Statement {
  constructor(sql) {
    this.sql = sql;
    this.stmt = null;
    this.params = [];
  }

  bind(params) {
    this.params = params;
    return this;
  }

  all() {
    this.stmt = db.prepare(this.sql);
    if (this.params.length > 0) this.stmt.bind(this.params);
    const rows = [];
    while (this.stmt.step()) {
      rows.push(this.stmt.getAsObject());
    }
    this.stmt.free();
    return rows;
  }

  get(params) {
    this.stmt = db.prepare(this.sql);
    if (params) this.stmt.bind(params);
    if (this.stmt.step()) {
      const row = this.stmt.getAsObject();
      this.stmt.free();
      return row;
    }
    this.stmt.free();
    return undefined;
  }

  run(params) {
    this.stmt = db.prepare(this.sql);
    if (params) this.stmt.bind(params);
    this.stmt.step();
    this.stmt.free();
    return { lastInsertRowid: 0, changes: 1 };
  }
}

export async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function exec(sql) {
  db.run(sql);
  saveDB();
}

export function prepare(sql) {
  return new Statement(sql);
}

export function getDB() {
  return db;
}
