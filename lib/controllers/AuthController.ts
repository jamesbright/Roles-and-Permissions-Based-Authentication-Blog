import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { RoleSchema } from '../models/roleModel';
import { LogSchema } from '../models/logModel';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserI } from '../interfaces/user';
import { RoleI } from '../interfaces/role';
import { LogI } from '../interfaces/log';
// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);

//Create an instance of the role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);

//Create an instance of the log model
const Log = mongoose.model<LogI>('Log', LogSchema);


class AuthController {


  public async register(req: Request, res: Response): Promise<any> {


    try {
      //check if already registered
      const user: UserI = await User.findOne({ email: req.body.email }, function (err: any) {
        if (err) {
          return res.status(500).send({ status: "Server error", code: 500, message: err });
        }
      });

      if (user) {
        return res.status(400).send({ status: 'bad request', code: 400, message: "Email already registered" });
      }
    } catch (err) {
      console.log(err)
    }

    // encrypt password
    const hashedPassword: string = bcrypt.hashSync(req.body.password, Number(process.env.BCRYPT_SALT));

    //create new user
    User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: hashedPassword,
      active: true,
      createdAt: Date.now()
    },
      (err, user) => {
        if (err) {
          return res.status(500).send({ status: "Server error", code: 500, message: err });

        } else {
          //assign 'user' role to the user
          Role.findOne({ name: "user" }, (err, role) => {
            if (err) {
              return res.status(500).send({ status: "Server error", code: 500, message: err });

            }
            // assign role to user 
            user.roles = [role._id];
            user.save(err => {
              if (err) {
                return res.status(500).send({ status: "Server error", code: 500, message: err });

              }
              Log.create({
                name: 'Registration',
                user: user._id,
                description: 'successfully registered'
              }, (err, log) => {
                log.save();
              });
              return res.status(201).send({ status: "Success", code: 201, message: 'Successfully registered' });

            });
          });



        }
      });

  }





  public login(req: Request, res: Response): void {

    //get the user using their email
    User.findOne({ email: req.body.email }, function (err: any, user: UserI) {
      if (err) return res.status(500).send({ status: "Server error", code: 500, message: err });
      //if user do not exist return not found
      if (!user) return res.status(404).send({ status: 'Not found', code: 404, message: 'User does not exist.' });

      //validate user password
      const validatePassword: boolean = bcrypt.compareSync(req.body.password, user.password);
      if (!validatePassword) return res.status(401).send({ auth: false, token: null, status: 'Unauthorized', code: 401, message: 'Wrong password' });

      //create and sign a token with the user id and email as payload
      const token: string = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });
      Log.create({
        name: 'Login',
        user: user._id,
        description: 'successfully logged in'
      }, (err, log) => {
        log.save();
      });
      return res.status(200).send({ auth: true, token: token, _id: user._id, status: 'Success', code: 200, message: 'Successfully logged in' });
    })
  }



}

export { AuthController }