import * as mongoose from 'mongoose';
 interface UserI extends mongoose.Document {
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
        type: Date
    }
}
export { UserI }