import { response } from '../response.js'
import UsersDB from '../databases/authDb.js'
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import MailService from '../services/mailServer.js'
import { config } from 'dotenv';
import TokenService from '../services/token-service.js'
import { validationResult } from 'express-validator';
import UserModel from '../models/userModel.js';

config()

const tokenService = new TokenService()
export default class UserController {
  bd;
  userModel;

  constructor() {
    this.initDatase()
  }

  initDatase = async () => {
    const userBd = new UsersDB()
    if (!this.bd) {
      this.bd = await userBd.initBd()
      this.userModel = new UserModel()
    }
  }

  getAllUsers = async (req, res) => {
    try {
      const answer = await this.userModel.getAllUsers()
      response(200, answer, res)
    } catch (err) {
      console.log(err)
      response(500, err, res);
    }
  }

  getUser = async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const temp = TokenService.validateAccessToken(token)
      const answer = await this.userModel.getUserByEmail(temp.email)
      console.log(answer)
      response(200, answer, res)
    } catch (err) {
      console.log(err)
      response(500, err, res);
    }
  }

  registration = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return response(400, { error: "Baq request", errors: errors }, res);
      }
      const { name, email, password } = req.body
      const check = await this.userModel.checkUserExistByEmail(email)
      if (check) {
        response(302, `User with name - ${email} already exist`, res)
        return true

      }
      const salt = bcrypt.genSaltSync(15)
      const passwordHash = await bcrypt.hash(password, salt)
      const activationLink = this.sendActivationMail(email)
      const insertId = await this.userModel.createUser(name, email, passwordHash, activationLink)
      const tokens = await tokenService.generateTokens({ email: email, id: insertId })
      console.log('tokens', tokens)
      await tokenService.saveToken(insertId, tokens.refreshToken)

      res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true }) // sameSite: 'none', secure: true
      response(200, { text: `Registration is successful`, token: tokens.accessToken }, res)

    } catch (err) {
      console.log(err)
      response(500, err, res);
    }

  }


  updateUser = async (req, res) => {
    try {

      const userId = await TokenService.getUserIdFromHeader(req)
      const { name, email, oldPassword, newPassword } = req.body
      console.log('body', req.body)
      const user = await this.userModel.getUserByid(userId)
      if (!user) {
        response(401, { message: `Пользователь с userId - ${userId} не найден. Пройдите регистрацию.` }, res)
        return
      }
      // console.log(user)
      if (oldPassword && newPassword) {
        const passwordEqual = bcrypt.compareSync(oldPassword, user.password)
        if (!passwordEqual) {
          return response(401, { message: `Пароль не верный.` }, res)
        }
      }

      const salt = bcrypt.genSaltSync(15)
      const passwordHash = newPassword? await bcrypt.hash(newPassword, salt): null
      const answer = await this.userModel.updateUser(name, email, userId, passwordHash )

      response(200, answer, res)

    } catch (err) {
      console.log(err)
      response(500, err, res);
    }

  }


  sendActivationMail(email) {
    const activationLink = uuidv4()
    const mailService = new MailService()
    mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/activate/${activationLink}`)
    return activationLink
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body
      const answer = await this.userModel.getUserByEmail(email)
      if (!answer) {
        response(401, { message: `Пользователь с email - ${email} не найден. Пройдите регистрацию.` }, res)
        return
      }
      console.log(answer)
      const passwordEqual = bcrypt.compareSync(password, answer.password)
      if (passwordEqual) {
        const tokens = await tokenService.generateTokens({
          userId: answer.id,
          email: answer.email
        })
        await tokenService.saveToken(answer.id, tokens.refreshToken)
        res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true })
        // console.log(res)
        response(200, { id: answer.id, token: tokens.accessToken }, res)

      } else {
        response(401, { message: `Пароль не верный.` }, res)

      }

    } catch (err) {
      console.log(err)
      response(500, err, res)
    }

  }

  logout = async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      console.log(refreshToken)
      const token = await tokenService.removeToken(refreshToken);
      res.clearCookie('refreshToken');
      return response(200, token, res);
    } catch (err) {
      console.log(err);
    }
  }

  activate = async (req, res, next) => {
    try {
      const activationLink = req.params.link;
      console.log(activationLink)
      const sqlCheck = `SELECT id FROM ${process.env.TABLENAME} WHERE activationLink = "${activationLink}"`;
      const [rows, fields] = await this.bd.query(sqlCheck)
      console.log(rows)
      if (typeof rows !== 'undefined' && rows.length > 0) {
        rows.map(async rw => {
          const sql = `UPDATE ${process.env.TABLENAME}
          SET isActivated = true
          WHERE id = ${rw.id}`
          await this.bd.query(sql)

          return true
        })
      }
      response(200, rows, res)
      // await userService.activate(activationLink);
      // return res.redirect(process.env.CLIENT_URL);
    } catch (err) {
      console.log(err)
      response(500, err, res);
    }
  }

  refresh = async (req, res) => {
    try {
      const { refreshToken } = req.cookies;
      console.log('refreshToken', refreshToken)
      if (!refreshToken) {
        return response(400, "No refresh Token", res);
      }
      const userData = TokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken)
      console.log('userData', userData)
      // console.
      if (!userData || !tokenFromDb) {
        return response(400, "Unauthorisation Error", res);
      }
      const userExist = await this.userModel.checkUserExistByEmail(userData.email)
      if (!userExist) {
        return response(401, { message: `Пользователь с id - ${userData.userId} не найден. Пройдите регистрацию.` }, res)
      }

      const tokens = await tokenService.generateTokens({
        userId: userData.userId,
        email: userData.email
      })
      return response(200, tokens.accessToken, res)



    } catch (err) {
      console.log(err);
      response(500, err, res);
    }
  }

}