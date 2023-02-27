import TokenService from '../services/token-service.js'
import { response } from '../response.js'

export default async function pass (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return response(403, 'Unauthorized access', res);
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return response(403, 'Unauthorized access', res);
        }

        const userData = await TokenService.validateAccessToken(accessToken);
        // console.log(userData)
        if (!userData) {
            return response(403, 'Unauthorized access', res);
        } 
        console.log('test')
        // req.user = userData;
        next();
    } catch (err) {
      console.log(err)
        return response(403, 'Unauthorized access', res);
    }
};