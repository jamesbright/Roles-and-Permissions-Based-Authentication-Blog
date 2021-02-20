import * as mongoose from 'mongoose';
import * as mongoose_fuzzy_searching from 'mongoose-fuzzy-searching';
//import mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const Schema = mongoose.Schema;
export const UserSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phoneNumber: {
        type: String,
        select: false
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    reset_password_token: {
        type: String
    },
    reset_password_expires: {
        type: String
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ],

    created_at: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.plugin(mongoose_fuzzy_searching, { fields: ['firstName', 'lastName'] })