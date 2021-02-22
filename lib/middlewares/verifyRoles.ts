import * as mongoose from 'mongoose';
import { RoleSchema } from '../models/roleModel';
import { Request, Response } from 'express';
import { RoleI } from '../interfaces/role'

//Create an instance of the role model
const Roles = mongoose.model<RoleI>('Role', RoleSchema);

export default function checkRolesExisted (req:Request, res:Response, next:Request) : any{
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!Roles.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });

          next;
      }
    }
  }

};