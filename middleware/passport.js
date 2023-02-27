import {Strategy, ExtractJwt } from 'passport-jwt';
import Connection from '../databases/createConnection.js';
import { config } from 'dotenv';
config()


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT 
}

export const jwtPass = (passport) => {
  passport.use(
      new Strategy(options, async (payload, done) => {
          try {
            console.log(payload)
            const authDb = await Connection.getInstance()
            authDb.query(`SELECT id, email FROM ${process.env.TABLENAME} WHERE id = "${payload.userId}"`, (error, rows, fields) => {
                  if(error) {
                      console.log(error)
                  } else {
                      const user = rows
                      if(user) {
                          done(null, user)
                      } else {
                          done(null, false)
                      }
                  }
              })
          } catch(e) {
              console.log(e);
          }
      })
  )
}