import * as mongoose from 'mongoose';



 interface UserI extends mongoose.Document {
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
         required: true
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
        type: Date
     },
}
export { UserI }