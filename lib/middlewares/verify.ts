import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
// initialize configuration
dotenv.config({ path: __dirname + '/.env' })
export default function verifyToken(req:any, res:any, next:any) {
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token,process.env.SECRET, function (err:any, decoded:any) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });

        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}

//module.exports = verifyToken;