import * as Joi from 'joi';
import { Request, Response } from 'express';

export default function validateBlog(req: Request, res: Response, next: any): any {

    //destructure request and store it in body variable
    const { body } = req;
 

    //define validation rules for regitration
    const BlogSchema = Joi.object().keys({
        title:Joi.string().required(),
        content: Joi.string().required(),
        author: Joi.string().required(),
        image: Joi.any()
            .meta({ swaggerType: 'file' })
            .description('image file')

    });

    //perform validation
    const result = BlogSchema.validate(body);

    // destructure result of validation into its' value and errors
    const { value, error } = result;

    const valid = error == null;


    //if there are errors return an error message
    if (!valid) {
        return res.status(422).send({ status: 'invalid request', code: 422, message: error });

    } else {

        //if there are no errors push request forward
        next();
    }

}