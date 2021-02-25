import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { RoleSchema } from '../models/roleModel';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserI } from '../interfaces/user';
import { RoleI } from '../interfaces/role';
// initialize configuration
dotenv.config()

//Create an instance of the user model
const User = mongoose.model<UserI>('User', UserSchema);

//Create an instance of the role model
const Role = mongoose.model<RoleI>('Role', RoleSchema);



class AuthController {


  public async register(req: Request, res: Response): Promise<any> {


    try {
      //check if already registered
      const user : UserI = await User.findOne({ email: req.body.email }, function (err:any) {
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
    const hashedPassword : string = bcrypt.hashSync(req.body.password, Number(process.env.BCRYPT_SALT));

    //create new user
    User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: hashedPassword,
      active: true,
      createdAt:Date.now()
    },
      (err, user) => {
        if (err) {
          return res.status(500).send({ status: "Server error", code: 500, message: err });

        } else {
          //if we have an array of roles from endpoint
          if (req.body.roles) {
            try {
              const userRoles: Array<string> = ['user', 'admin', 'superAdmin'];
              for (let i = 0; i < req.body.roles.length; i++) {
                //if roles sent from endpoint does not exist in collection return error
                if (!userRoles.includes(req.body.roles[i])) {
                  return res.status(400).send({ status: "bad request", code: 400, message: `Failed to assign role, Role ${req.body.roles[i]} does not exist or is not an array!` });
                }
            
              }
            } catch (err) {
              console.log(err);
            }
            // find all roles from role collection that matches user roles from request
            Role.find(
              {
                name: { $in: req.body.roles }
              },
              (err: any, roles: Record<string, unknown>) => {
                if (err) {
                  return res.status(500).send({ status: "Server error", code: 500, message: err });

                }
                if (roles == null) {
                  return res.status(404).send({ status: "Not found", code: 404, message: "Roles not available" });

                }
                //assign all roles to user
                Object.keys(roles).forEach((key: string) => {
                  user.roles.push(roles[key]['_id'])
                });
                //save the result
                user.save(err => {
                  if (err) {
                    return res.status(500).send({ status: "Server error", code: 500, message: err });
                    
                  }

                  return res.status(201).send({ status: "Success", code: 201, message: 'Successfully registered' });
                });
              }
            );
          } else {
            //if no roles was sent from endpoint then assign user role to the user
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

                return res.status(201).send({ status: "Success", code: 201, message: 'Successfully registered' });

              });
            });
          }


        }
      });

  }





  public login(req: Request, res: Response): void {

    //get the user using their email
    User.findOne({ email: req.body.email }, function (err:any, user:UserI) {
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

      return res.status(200).send({ auth: true, token: token, _id: user._id, status: 'Success', code: 200, message: 'Successfully logged in' });
    })
  }



}

export { AuthController }