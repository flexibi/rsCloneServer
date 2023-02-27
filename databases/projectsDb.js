import mysqlPromise from 'mysql2/promise.js';
import dotenv from 'dotenv'
dotenv.config()

export default async function initProjectsBd(dataDb, id) {

  const sql = `CREATE TABLE IF NOT EXISTS table_${id} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(255)
  );`

  await dataDb.query(sql);
  console.log(`Table table_${id} created`);

}