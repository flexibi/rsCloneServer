import mysqlPromise from 'mysql2/promise.js';
import mysql from 'mysql2';
import dotenv from 'dotenv'
dotenv.config()


export default class Connection {
  
  // static async getInstance() {
  //     const connection = await mysqlPromise.createConnection({
  //       host: process.env.HOST,
  //       port: process.env.DBPORT,
  //       user: process.env.DBUSER,
  //       password: process.env.DBPASSWORD,
  //       database: process.env.DBNAME
  //     });
      
  //     try {
  //       await connection.connect()
  //       console.log(`Connected to database as id ${connection.threadId}`);
  //     } catch (err) {
  //       console.error(`Error connecting to database: ${err.stack}`);
  //     }
  //   return connection;
  // }

  // static query(sql, values) {
  //   return Connection.connection.query(sql, values);
  // }
  
  static async createPool() {
    const connection =  mysql.createPool({
      connectionLimit: 999,
      host: process.env.HOST,
      port: process.env.DBPORT,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      keepAliveInitialDelay: 10000,
      enableKeepAlive: true
    }).promise();
    return connection
  }
}


// const connection = Connection.getInstance()
// console.log(connection)