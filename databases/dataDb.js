import dotenv from 'dotenv'
import Connection from './createConnection.js';
dotenv.config()

export default class DataDB {
  async initBd() {
    const dataDb = await Connection.createPool()
    const createTable = `CREATE TABLE IF NOT EXISTS ${process.env.TABLEUSERDATANAME} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      projectId INT NOT NULL,
      projectName VARCHAR(255),
      bildHash VARCHAR(255)
    );`
    // path VARCHAR(255)
    
    // ${user_id}/${project_name})

    const result = await dataDb.query(createTable);
    // console.log(result)
    console.log(`Table ${process.env.TABLEUSERDATANAME} created`);
    this.db = dataDb
    return dataDb
  }
  
}