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


  public register(req: Request, res: Response, next:any): any {


    try {
      //check if already registered
      User.findOne({ email: req.body.email }, function (err, user) {
        if (err) return res.status(500).send({ status: "Server error", code: 500, message: err });
        if (user) return res.status(404).send({ status: 'Not found', code: 404, message: "Email already registered" });
      });
    } catch (err) {
      console.log(err)
    }
      
        // encrypt password
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);

        //create new user
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            password: hashedPassword
        },
            (err, user) => {
                if (err) {
                                    return res.status(500).send({status:"Server error", code:500, message: err });

                } else {
                  //if we have an array of roles from endpoint
                    if (req.body.roles) {
                      // find all roles from database
                        Role.find(
                            {
                                name: { $in: req.body.roles }
                            },
                            (err, roles:object) => {
                                if (err) {
                                    return res.status(500).send({status:"Server error", code:500, message: err });
                                    
                              }
                                if (roles == null) {
                                    return res.status(404).send({status:"Not found", code:404, message: "Roles not available" });
                                    
                              }
                            //assign all roles to user
                              Object.keys(roles).forEach((key: string) => {                              
                                  user.roles.push(roles[key]['_id'])                                
                              });
                               //save the result
                                user.save(err => {
                                    if (err) {
                                        res.status(500).send({ status:"Server error", code:500, message: err });
                                        return;
                                    }

                                  return res.status(200).send({ status: "Success", code: 200, message: 'Successfully registered' });
      });
                            }
                        );
                    } else {
                      //if no roles was sent from endpoint then assign superAdmin to the user
                        Role.findOne({ name: "superAdmin" }, (err, role) => {
                            if (err) {
                                res.status(500).send({status:"Server error", code:500, message: err });
                                return;
                            }
                             // assign role to user 
                            user.roles = [role._id];
                            user.save(err => {
                                if (err) {
                                    res.status(500).send({ status:"Server error", code:500, message: err });
                                    return;
                                }
                             
return res.status(200).send({ status:"Success", code:200, message: 'Successfully registered' });
                             
                            });
                        });
                    }

                   
                           }
            });

  }





  public login(req: Request, res: Response): void {
    
    //get the user using their email
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send({ status:"Server error", code:500, message:err });
      //if user do not exist return not found
      if (!user) return res.status(404).send({ status:'Not found', code:404, message: 'User does not exist.' });

      //validate user password
      const validatePassword = bcrypt.compareSync(req.body.password, user.password);
      if (!validatePassword) return res.status(401).send({ auth: false, token: null, status:'Unauthorized', code:401, message: 'Wrong password' });

      //create and sign a token with the user id and email as payload
      const token = jwt.sign({ id: user._id,email: user.email }, process.env.SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });

      return res.status(200).send({ auth: true, token: token, _id: user._id, status:'Success', code:200, message: 'Successfully logged in' });
    })
  }



}

export { AuthController }