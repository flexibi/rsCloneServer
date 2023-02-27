import dotenv from 'dotenv'
import DataDB from '../databases/dataDb.js'
import { response } from '../response.js'
import DataModel from '../models/dataModel.js';
import TokenService from '../services/token-service.js';
import generate from '../utils/binding.js';
dotenv.config()

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';

const __dirname = join(dirname(fileURLToPath(import.meta.url)), "..");
console.log(__dirname)

export default class DataController {
  dataModel
  constructor() {
    this.initDatase()
  }

  initDatase = async () => {
    this.dataModel = new DataModel()

  }

  getUserProjects = async (req, res) => {
    try {
      console.log('cookies', req.cookies)

      const userId = await TokenService.getUserIdFromHeader(req)
      console.log('userId', userId)
      const answer = await this.dataModel.getUserData(userId)
      console.log(answer)
      if (!answer) {
        return response(400, "User doesn't exist", res)

      }

      response(200, answer, res)
    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }


  addProject = async (req, res) => {
    try {
      const { projectName, data } = req.body
      const userId = await TokenService.getUserIdFromHeader(req)

      const answer = await this.dataModel.addNewProjects(userId, projectName, data)
      response(200, { projectId: answer.projectId }, res)
    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }

  updateProject = async (req, res) => {
    try {
      const { projectId, projectName, data } = req.body
      const userId = await TokenService.getUserIdFromHeader(req)
      const answer = await this.dataModel.updateProject(userId, projectId, projectName, data)
      console.log(answer[0].insertId)
      if (answer[0].affectedRows) {
        response(200, `Project ${projectId} updated`, res)
      } else {
        response(400, `Project ${projectId} doesn't exist`, res)
      }
    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }

  deleteProject = async (req, res) => {
    try {
      const { projectId } = req.body
      const userId = await TokenService.getUserIdFromHeader(req)

      const answer = await this.dataModel.deleteProject(userId, projectId)
      console.log(answer[0])
      if (answer) {
        response(200, `Project ${projectId} deleted`, res)
      } else {
        response(302, `Project ${projectId} doesn't exist`, res)
      }
    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }

  bindProject = async (req, res) => {
    try {
      const { projectId } = req.body
      console.log("projectId", projectId)

      const userId = await TokenService.getUserIdFromHeader(req)
      const project = await this.dataModel.getProjectByid(userId, projectId)
      // console.log('project', project)
      const json = await this.dataModel.readProjectFiles(project)
      // console.log('json', json.projectFiles)
      const hash = await this.dataModel.setBindHash(userId, projectId)
      await Promise.all(json.projectFiles.map(async file => {
        const data = generate(file.content)
        
        const temp = await this.dataModel.writeBindingFile(data, hash, file.fileName)

      }))
      console.log("hash", hash)
      // console.log('answer bind', answer)

      response(200, `${process.env.API_URL}/api/page/${hash}/Main.html`, res) // /main.html

    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }

  findBindingProjectByUrl = async (req, res) => {
    try {
      const dataPath = __dirname + '/data'
      const {hash, file} = req.params
      console.log("test", hash, file)
      if (await this.dataModel.checkBindingProject(hash, file)) {
        console.log(`${dataPath}/bind/${hash}/${file}`)
        res.sendFile(`${dataPath}/bind/${hash}/${file}`)
      } else {
        return response(404, 'no such file', res)
      }

    } catch (err) {
      console.log(err)
      response(500, err, res)
    }
  }



}