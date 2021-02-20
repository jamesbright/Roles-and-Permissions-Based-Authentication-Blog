import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { RoleSchema } from '../models/roleModel';
import { UserSchema } from '../models/userModel';
import * as dotenv from 'dotenv';
import { UserI } from '../interfaces/user'
import { RoleI } from '../interfaces/role'
// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);
//Create an instance of the role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);

function verifyToken(req: Request, res: Response, next: any): any {
    const token: any = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });

        // if everything's good
      req['userId'] = decoded.id;
        next();
    });
}

function isAdmin(req: Request, res: Response, next): any {
    User.findById(req['userId']).exec(function(err, user){
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role!" });
                return;
            }
        );
    });
};

function isModerator(req: Request, res: Response, next: any): any {
    User.findById(req['userId']).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "moderator") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Moderator Role!" });
                return;
            }
        );
    });
};


   export { verifyToken,isAdmin,isModerator }