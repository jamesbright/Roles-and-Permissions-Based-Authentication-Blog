import * as mongoose from 'mongoose';
import * as mongoose_fuzzy_searching from 'mongoose-fuzzy-searching';

const Schema = mongoose.Schema;
export const UserSchema = new Schema({
    firstName: {
        type: String,
        index:true,
        required:true
    },
    lastName: {
        type: String,
        index: true,
        required:true
    },
    phoneNumber: {
        type: String,
        index: true,
        required:true
    },
    email: {
        type: String,
        index: true,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true
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
            ref: "Role",
            index: true
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