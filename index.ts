import sqlite3 from 'sqlite3';
sqlite3.verbose();

export class Database {
    private static instance: Database | null = null;
    private db: sqlite3.Database;

    /**
     * do not use, use Database.getInstance()
     */
    private constructor(path?: string) {
        if(!path) throw new Error('[error] When connecting to the database for the first time, the path needs to be defined.');
        this.db = new sqlite3.Database(path);
    }

    /**
     * always use this
     * @returns this
     */
    public static getInstance(path?: string): Database {
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
    public async isTableExist(tableName: string): Promise<boolean> {
        return new Promise((res, rej) => {
            this.db.serialize(() => {
                this.db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,[], (err: Error, row: any) => {
                    if (err) rej(err);
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
    public async createTable(tableName: string, ...columns: ColumnDef[]) {
        const columnDefs = columns.map((column: ColumnDef) => createColumns(column));
        return new Promise<void>((res, rej) => {
            this.db.serialize(() => {
                const columns = columnDefs.join(', ');
                const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
                this.db.run(query, [], (err: Error) => {
                    if (err) rej(err);
                    else res();
                });
            });
        });
    }

    /**
     * 
     * @param tableName table name
     * @returns 
     */
    public async dropTable(tableName: string) {
        return new Promise<void>((res, rej) => {
            this.db.serialize(() => {
                const query = `DROP TABLE IF EXISTS ${tableName}`;
                this.db.run(query, [], (err: Error) => {
                    if (err) rej(err);
                    else res();
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
    public async insert(tableName: string, ...data: Record<string, any>[]) {
        const columns = Object.keys(data[0]);
        const values = data.map(obj => columns.map(col => obj[col]));
        const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');

        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
        return new Promise<number>((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query, values.flat(), function (err: Error) {
                    if (err) rej(err);
                    else res(this.lastID);
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
    public async update(tableName: string, data: Record<string, any>, where: string) {
        const fields = Object.entries(data)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');
        const query = `UPDATE ${tableName} SET ${fields} WHERE ${where}`;

        return new Promise<void>((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query,[], (err: Error) => {
                    if (err) rej(err);
                    else res();
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
    public async delete(tableName: string, where: string) {
        const query = `DELETE FROM ${tableName} WHERE ${where}`;

        return new Promise<void>((res, rej) => {
            this.db.serialize(() => {
                this.db.run(query, (err: Error) => {
                    if (err) rej(err);
                    else res();
                });
            })
        });
    }

    /**
     *
     * @param tableName table name
     * @param where a string
     * @returns array of data
     * @example select('example', 'age=\'25\'');
     */
    public async select(tableName: string, columns: string[], where?: string, limit?: number) {
        const selectedColumns = columns.length ? columns.join(', ') : '*';
        const whereClause = where ? `WHERE ${where}` : '';
        const limitClause = limit ? `LIMIT ${limit}` : '';
        const query = `SELECT ${selectedColumns} FROM ${tableName} ${whereClause} ${limitClause}`;

        return new Promise((res, rej) => {
            this.db.all(query, (err: Error, rows: any[]) => {
                if (err) rej(err);
                else res(rows);
            });
        });
    }

    /**
     *
     * @param tableName table name
     * @returns array of data
     * @example selectAll('example');
     */
    public async selectAll(tableName: string): Promise<any[]> {
        return new Promise((res, rej) => {
            this.db.all(`SELECT * FROM ${tableName}`, (err: Error, rows: any[]) => {
                if (err) rej(err);
                res(rows);
            });
        });
    }

    public close() {
        this.db.close();
        Database.instance = null;
    }
}

function createColumns(column: ColumnDef) {
    let columnDef = `${column.name} ${column.type}`;
    if (column.primaryKey) columnDef += ' PRIMARY KEY';
    if (column.autoIncrement) columnDef += ' AUTOINCREMENT';
    if (column.notNull) columnDef += ' NOT NULL';
    if (column.unique) columnDef += ' UNIQUE';
    if (column.defaultValue !== undefined) columnDef += ` DEFAULT ${column.defaultValue}`;
    return columnDef;
}

export type columnType = 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB' | 'BOOLEAN' | 'DATE' | 'TIME' | 'DATETIME' | 'NUMERIC';

interface ColumnDef {
    name: string;
    type: columnType;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    notNull?: boolean;
    unique?: boolean;
    defaultValue?: any;
}