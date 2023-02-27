import dotenv from 'dotenv'
dotenv.config()
import { readFile, writeFile, unlink, mkdir, readdir, rm , access} from 'fs/promises';
import Connection from '../databases/createConnection.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';



export default class DataModel {
  bd;

  constructor() {
    this.dataPath = process.cwd() + '/data'
    mkdir(`${this.dataPath}`, { recursive: true })
    this.initConnection()
  }

  async initConnection() {
    this.bd = await Connection.createPool()
  }

  async selectAllProjects(userId) {

    const sql = `SELECT * FROM ${process.env.TABLEUSERDATANAME} where userId = ${userId}`
    const result = await this.bd.query(sql)
    return result[0]
  }

  async getUserData(userId) {
    const result = await this.selectAllProjects(userId)
    if (result.length === 0) {
      return []
    }
    const answer = await Promise.all(result.map(async (data) => {
      return await this.readProjectFiles(data)
    }))
    return answer.filter(el => !!el)
  }

  async addNewProjects(userId, projectName, data) {
    const allProjects = await this.selectAllProjects(userId)
    const projectId = allProjects.length ? allProjects[allProjects.length - 1].projectId + 1 : 0

    const sql = `INSERT INTO ${process.env.TABLEUSERDATANAME} (userId, projectId, projectName)
      VALUES (${userId}, ${projectId}, '${projectName}');`
    this.writeProjectFiles(userId, projectId, data)
    const result = await this.bd.query(sql)
    return { result: result, projectId: projectId }
  }


  async updateProject(userId, projectId, projectName, data) {
    const sql = `UPDATE ${process.env.TABLEUSERDATANAME}
    SET projectName = '${projectName}'
    WHERE projectId = ${projectId} AND userId = ${userId}`
    const answer = await this.bd.query(sql)
    this.writeProjectFiles(userId, projectId, data)
    return answer

  }

  async deleteProject(userId, projectId) {
    try {
      const sql = `DELETE FROM ${process.env.TABLEUSERDATANAME}
    WHERE projectId = ${projectId} AND userId = ${userId};`
      const answer = await this.bd.query(sql, projectId)
      await rm((`${this.dataPath}/${userId}/${projectId}/`), { recursive: true })
      return true
    } catch (err) {
      console.log(err)
      return false
    }


  }
  async readProjectFiles(data) {
    try {
      const projetfileNames = await readdir(`${this.dataPath}/${data.userId}/${data.projectId}`)

      const files = await Promise.all(projetfileNames.map(async fileName => {
        const content = await readFile(`${this.dataPath}/${data.userId}/${data.projectId}/${fileName}`, 'utf8')
        return { fileName: fileName, content: content }
      }))
      return {
        projectId: data.projectId,
        projectName: data.projectName,
        projectFiles: files
      }
    } catch (err) {
      console.log(err)
    }

  }
  
  async getProjectByid(userId, projectId) {
    const sqlCheck = `SELECT * FROM ${process.env.TABLEUSERDATANAME}  WHERE projectId = ? AND userId = ?`;
    const answer = await this.bd.query(sqlCheck, [projectId, userId])
    // console.log('project by id',answer[0])
    // const json = 
    return answer[0][0]
  }
  
  writeProjectFiles = async (id, projectName, data) => {
    await mkdir(`${this.dataPath}/${id}/${projectName}`, { recursive: true })
    data.forEach(el => {
      writeFile(`${this.dataPath}/${id}/${projectName}/${el.fileName}`, el.content)
    })
  }

  writeBindingFile = async (data, hash, name) => {
    await mkdir(`${this.dataPath}/bind/${hash}`, { recursive: true })
    await writeFile(`${this.dataPath}/bind/${hash}/${path.parse(name).name}.html`, data)
    console.log(`${this.dataPath}/bind/${hash}/${path.parse(name).name}.html`)
  }

  setBindHash = async (userId, projectId) => {
    const bildHash = uuidv4()
    const sql = `UPDATE ${process.env.TABLEUSERDATANAME}
    SET bildHash = '${bildHash}'
    WHERE projectId = ${projectId} AND userId = ${userId}`
    const answer = await this.bd.query(sql)
    return bildHash

  }
  
  async getProjectByHash(userId, bildHash) {
    const sqlCheck = `SELECT * FROM ${process.env.TABLEUSERDATANAME}  WHERE bildHash = ? AND userId = ?`;
    const answer = await this.bd.query(sqlCheck, [bildHash, userId])
    console.log(answer[0])
    // console.log('project by id',answer[0])
    // const json = 
    return !!answer[0][0]
  }
  
  async checkBindingProject(hash, file) {
    try {
      const projetfileNames = await access(`${this.dataPath}/bind/${hash}/${file}`)
      return true
    } catch (err) {
      console.log(err)
      return false
    }

  }
  
}