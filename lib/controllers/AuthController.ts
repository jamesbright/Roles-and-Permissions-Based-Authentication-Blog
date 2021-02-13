import * as mongoose from 'mongoose';
import { UserSchema } from '../models/userModel';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// initialize configuration
dotenv.config({ path: __dirname + '/.env' })

const User = mongoose.model('User', UserSchema);
export class AuthController {

    public register(req: Request, res: Response) {
        //check if already registered
        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) return res.status(500).send({ 'error': 'Server error' });
            if (user) return res.status(404).send({ 'error': 'Email exists' });
        });

        // encrypt password
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);

        //create new user
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        },
            function (err, user) {
                if (err) return res.status(500).send({ 'error': 'Server error' })
                // create a token
                const token = jwt.sign({ id: user._id }, process.env.SECRET, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send({ auth: true, token: token, message: 'Successfull' });
            });
    };

    public login(req: Request, res: Response) {
        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) return res.status(500).send({ 'error': 'Server error' });
            if (!user) return res.status(404).send({ 'error': 'User does not exist.' });

            //validate user password
            const validatePassword = bcrypt.compareSync(req.body.password, user.password);
            if (!validatePassword) return res.status(401).send({ auth: false, token: null, 'error': 'Wrong password' });

            const token = jwt.sign({ id: user._id }, process.env.SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });

            res.status(200).send({ auth: true, token: token,user_id:user._id, message: 'Successfull' });
        });
    };


    public someResource(req: any, res: Response) {
        User.findById(req.body.id, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");

            res.status(200).send({name:user.name, email: user.email, auth:true, message:'Acces granted' });
        });

    };


}