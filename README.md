# Singleton sqlite3
This is a Node.js module that provides an interface for interacting with SQLite3 databases. It exports a `Database` class with methods for creating, dropping, inserting, updating, deleting, and selecting data from tables.

## Installation
You can install Singleton SQLite3 using npm:

```
npm install singleton-sqlite3
```
npm link: https://www.npmjs.com/package/singleton-sqlite3

## Usage
Here are some examples of how to use the `singleton-sqlite3` module.

### Initialization

```js
import { Database } from 'singleton-sqlite3';

// Create an instance of the database
const db = Database.getInstance('./mydb.db');
```

### Creating a table

```js
// Define column definitions
const columns = [
  { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
  { name: 'name', type: 'TEXT' },
  { name: 'age', type: 'INTEGER' }
];

// Create the table
await db.createTable('people', ...columns);
```

### Drop a table
```js
await db.dropTable('people');
```

### Check if a table exists
```js
const tableExists = await db.isTableExist('people');
```

### Inserting data
```js
// Insert a single row of data
const lastId = await db.insert('people', { name: 'Alice', age: 30 });

// Insert multiple rows of data
const lastId = await db.insert('people', { name: 'Bob', age: 25 }, { name: 'Charlie', age: 35 });
```

### Updating data
```js
// Update a row of data
await db.update('people', { name: 'Alice', age: 31 }, 'name=\'Alice\'');

// Update multiple rows of data
await db.update('people', { age: 26 }, 'name=\'Bob\' OR name=\'Charlie\'');
```

### Deleting data
```js
// Delete a row of data
await db.delete('people', 'name=\'Alice\'');

// Delete multiple rows of data
await db.delete('people', 'age > 30');
```

### Querying data
```js
// Select all data
const [{ name, age }] = await db.selectAll('people');
 
// Select data with a WHERE clause
const youngPeople = await db.select('people', 'age < 30');
```

### Close connection
```js
db.clode();
```

## API

The following methods are available:

### `Database.getInstance(path?: string): Database`
Returns the instance of the Database class. If the instance has not been created yet, a new connection to the sqlite3 database will be established using the provided path parameter. If path is not defined during the initial call, an error will occur.



### `isTableExist(tableName: string): Promise<boolean>`
Check if a table exists in the database.
#### Parameters:
- `tableName`: The name of the table.
#### Returns: 
`true` or `false`.

### `createTable(tableName: string, ...columns: ColumnDef[]): Promise<void>`
Create a table in the database.
#### Parameters:
- `tableName`: The name of the table.
- `...columns`: An array of `ColumnDef` objects representing the columns of the table.
#### ColumnDef Properties:
- `name` (string): The name of the column.
- `type` (columnType): The data type of the column.
    #### columnType:
    A string representing the data type of a column. Possible values are:

    - `'INTEGER'`
    - `'REAL'`
    - `'TEXT'`
    - `'BLOB'`
    - `'BOOLEAN'`
    - `'DATE'`
    - `'TIME'`
    - `'DATETIME'`
    - `'NUMERIC'`
- `primaryKey` (boolean, optional): Whether the column is a primary key.
- `autoIncrement` (boolean, optional): Whether the column should auto-increment.
- `notNull` (boolean, optional): Whether the column should not allow null values.
- `unique` (boolean, optional): Whether the column should have unique values.
- `defaultValue` (any, optional): The default value of the column.

### `dropTable(tableName: string): Promise<void>`
Drop a table from the database.
#### Parameters:
- `tableName`: The name of the table.

### `db.insert(tableName: string, ...data: Record<string, any>[]): Promise<number>`
Inserts one or more records into a table.
#### Parameters:
- `tableName`: The name of the table to insert the records into.
- `data`: One or more records to insert. Each record must be a JavaScript object with key-value pairs corresponding to the columns in the table.
#### Returns: 
A promise that resolves with the last inserted row ID.

### `db.update(tableName: string, data: Record<string, any>, where: string): Promise<void>`
Updates records in a table.
#### Parameters:
- `tableName`: The name of the table to update records in.
- `data`: An object containing key-value pairs of the columns and their new values to update.
- `where`: A string specifying the WHERE clause of the UPDATE statement.
#### Returns: 
A promise that resolves with no value.

### `db.delete(tableName: string, where: string): Promise<void>`
Deletes records from a table.
#### Parameters:
- `tableName`: The name of the table to delete records from.
- `where`: A string specifying the WHERE clause of the DELETE statement.
#### Returns:
A promise that resolves with no value.

### `db.select(tableName: string, columns: string[], where?: string, limit?: number): Promise<any[]>`
Selects records from a table.
#### Parameters:
- `tableNam`e: The name of the table to select records from.
- `columns`: An array of column names to retrieve from the table. If empty, all columns will be retrieved.
- `where` (optional): A string specifying the WHERE clause of the SELECT statement.
- `limit` (optional): The maximum number of records to retrieve.
#### Returns:
A promise that resolves with an array of records matching the query.

### `db.selectAll(tableName: string): Promise<any[]>`
Selects all records from a table.`
#### Parameters:
`tableName`: The name of the table to select records from.
#### Returns:
A promise that resolves with an array of all records in the table.

### `close()`
Close the database connection.

## Contact
You can contact me via the following methods:
- Twitter: @organic_san_
- Discord: organic_san_2#2202
- Discord server: [https://discord.gg/hveXGk5Qmz](https://discord.gg/hveXGk5Qmz)

## License
singleton-sqlite3 is released under the MIT License.
