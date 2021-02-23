import * as Joi from 'joi';
import { Request, Response } from 'express';

export default function validateLogin(req: Request, res: Response, next:any): any {

    //destructure request and store it in body variable
    const { body } = req;

    //define validation rules for regitration
    const loginSchema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    //perform validation
    const result = loginSchema.validate(body);

    // destructure result of validation into its' value and errors
    const { value, error } = result;

    const valid = error == null;


    //if there are errors return an error message
    if (!valid) {
        return res.status(400).send({ status: 'invalid request', code: 422, message: error });

    } else {

        //if there are no errors push request forward
        next();
    }

};