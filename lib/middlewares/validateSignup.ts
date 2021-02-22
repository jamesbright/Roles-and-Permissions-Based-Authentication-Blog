
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';


export default function validateSignup (req:Request, res:Response, next) : any{
    //is email a valid email
  body('email').isEmail();
  // password must be at least 8 chars long
  body('password').isLength({ min: 8 });
    // if theres an error in validation, return
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ status: 'Bad request', code:400, message: errors.array() });
        }
  next();
  

};