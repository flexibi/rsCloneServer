import dotenv from 'dotenv'
dotenv.config()
import Connection from '../databases/createConnection.js';

export default class UserModel {
  bd;
  constructor() {
    this.initConnection()
  }

  async initConnection() {
    this.bd = await Connection.createPool()
  }


  async createUser(name, email, passwordHash, activationLink) {
    // await this.initConnection()
    const sql = `INSERT INTO ${process.env.TABLENAME}(name, email, password, activationLink) VALUES("${name}", "${email}", "${passwordHash}", "${activationLink}")`;
    const answer = await this.bd.query(sql)
    // await this.bd.end()
    return answer[0].insertId
  }

  async updateUser(name, email, id, passwordHash) {
    // await this.initConnection()
    const passwordSql = passwordHash ? ', password = ?' : '';
    const passwordValue = passwordHash ? passwordHash : '';
    const sql = `UPDATE ${process.env.TABLENAME}
                    SET name = ?, email = ?${passwordSql}
                    WHERE id = ?`;

    const values = [name, email, passwordValue, id];
    if(!passwordValue) {
      values.splice(2, 1)
    }
    console.log('values', values)
    const answer = await this.bd.query(sql, values)
    console.log('answer', answer)
    // await this.bd.end()

    return answer
  }

  async getUserByEmail(email) {
    // await this.initConnection()
    const sqlCheck = `SELECT id, name, email, password, isActivated FROM ${process.env.TABLENAME} WHERE email = "${email}"`;
    const answer = await this.bd.query(sqlCheck)
    // await this.bd.end()
    // return answer[0].length > 0
    return answer[0][0]
  }

  async checkUserExistByEmail(email) {
    return !!(await this.getUserByEmail(email))
  }

  async getUserByid(userId) {
    // await this.initConnection()
    const sqlCheck = `SELECT id, email, password FROM ${process.env.TABLENAME} WHERE id = ${userId}`;
    const answer = await this.bd.query(sqlCheck)
    // await this.bd.end()
    return answer[0][0]
  }

  async getAllUsers() {
    // await this.initConnection()
    const answer = await this.bd.query(`SELECT id, email password FROM ${process.env.TABLENAME}`)
    // await this.bd.end()
    return answer[0]
  }



}