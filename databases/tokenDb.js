import dotenv from 'dotenv'
import Connection from './createConnection.js';
dotenv.config()

export default class TokenDB {
  async initBd() {
    const dataDb = await Connection.createPool()
    const createTable = `CREATE TABLE IF NOT EXISTS ${process.env.TABLETOKENNAME} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL UNIQUE,
      token VARCHAR(255) NOT NULL
    );`

    const result = await dataDb.query(createTable);
    // console.log(result)
    console.log(`Table ${process.env.TABLETOKENNAME} created`);
    this.db = dataDb
    return dataDb
  }
  
}