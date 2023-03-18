import sqlite3 from 'sqlite3';
sqlite3.verbose();
class Database {
    /**
     * do not use, use Database.getInstance()
     */
    constructor(path) {
        if (!path)
            throw new Error('[error] When connecting to the database for the first time, the path needs to be defined.');
        this.db = new sqlite3.Database(path);
    }
    /**
     * always use this
     * @returns this
     */
    static getInstance(path) {
        if (!Database.instance) {
            Database.instance = new Database(path);
        }
        return Database.instance;
    }
    /**
     * is table exist
     * @param tableName
     * @returns true or false
     */
    async isTableExist(tableName) {
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                this.db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, [], (err, row) => {
                    if (err)
                        rej(err);
                    res(!!row);
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @param columns columns data
     * @returns
     * @example createTable('example', { name: 'id', type: "INTEGER", autoIncrement: true }, { name: "name", type: "TEXT" });
     */
    async createTable(tableName, ...columns) {
        const columnDefs = columns.map((column) => createColumns(column));
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                const columns = columnDefs.join(', ');
                const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
                this.db.run(query, [], (err) => {
                    if (err)
                        rej(err);
                    else
                        res();
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @returns
     */
    async dropTable(tableName) {
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                const query = `DROP TABLE IF EXISTS ${tableName}`;
                this.db.run(query, [], (err) => {
                    if (err)
                        rej(err);
                    else
                        res();
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @param data insert data
     * @returns PromiseM<lastID>
     * @example insert('example', { name: 'John', age: 25 }, { name: 'Alice', age: 30 });
     */
    async insert(tableName, ...data) {
        const columns = Object.keys(data[0]);
        const values = data.map(obj => columns.map(col => obj[col]));
        const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query, values.flat(), function (err) {
                    if (err)
                        rej(err);
                    else
                        res(this.lastID);
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @param data insert data (single)
     * @param where a string
     * @returns
     * @example update('example', { name: 'John' }, 'age=\'25\'');
     */
    async update(tableName, data, where) {
        const fields = Object.entries(data)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');
        const query = `UPDATE ${tableName} SET ${fields} WHERE ${where}`;
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query, [], (err) => {
                    if (err)
                        rej(err);
                    else
                        res();
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @param where a string
     * @returns
     * @example delete('example', 'age=\'25\'');
     */
    async delete(tableName, where) {
        const query = `DELETE FROM ${tableName} WHERE ${where}`;
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query, (err) => {
                    if (err)
                        rej(err);
                    else
                        res();
                });
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @param where a string
     * @returns array of data
     * @example select('example', 'age=\'25\'');
     */
    async select(tableName, columns, where, limit) {
        const selectedColumns = columns.length ? columns.join(', ') : '*';
        const whereClause = where ? `WHERE ${where}` : '';
        const limitClause = limit ? `LIMIT ${limit}` : '';
        const query = `SELECT ${selectedColumns} FROM ${tableName} ${whereClause} ${limitClause}`;
        return new Promise((res, rej) => {
            this.db.all(query, (err, rows) => {
                if (err)
                    rej(err);
                else
                    res(rows);
            });
        });
    }
    /**
     *
     * @param tableName table name
     * @returns array of data
     * @example selectAll('example');
     */
    async selectAll(tableName) {
        return new Promise((res, rej) => {
            this.db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                if (err)
                    rej(err);
                res(rows);
            });
        });
    }
    close() {
        this.db.close();
        Database.instance = null;
    }
}
Database.instance = null;
export { Database };
function createColumns(column) {
    let columnDef = `${column.name} ${column.type}`;
    if (column.primaryKey)
        columnDef += ' PRIMARY KEY';
    if (column.autoIncrement)
        columnDef += ' AUTOINCREMENT';
    if (column.notNull)
        columnDef += ' NOT NULL';
    if (column.unique)
        columnDef += ' UNIQUE';
    if (column.defaultValue !== undefined)
        columnDef += ` DEFAULT ${column.defaultValue}`;
    return columnDef;
}
