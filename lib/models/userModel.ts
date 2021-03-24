import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const UserSchema = new Schema({
    firstName: {
        type: String,
        index: true,
        required: true
    },
    lastName: {
        type: String,
        index: true,
        required: true
    },
    phoneNumber: {
        type: String,
        index: true,
        required: true
    },
    email: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select:false
    },
    reset_password_token: {
        type: String
    },
    reset_password_expires: {
        type: String
    },
    active: Boolean,

    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            index: true
            
        }
    ],

 
},
    { timestamps: true }
);
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phoneNumber: 'text', createdAt: 'text', });
