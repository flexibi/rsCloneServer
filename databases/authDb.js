import dotenv from 'dotenv';
import Connection from './createConnection.js';
dotenv.config()

export default class UsersDB {
  async initBd() {
    const authDb = await Connection.createPool()
    const createTable =`CREATE TABLE IF NOT EXISTS ${process.env.TABLENAME} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      isActivated BOOL NOT NULL DEFAULT false,
      activationLink VARCHAR(255)
    );`
        
    const result = await authDb.query(createTable);
    // console.log(result)
    console.log(`Table ${process.env.TABLENAME} created`);
    return authDb
  }
  
}




