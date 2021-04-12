import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const LogSchema = new Schema({
    name: String,
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: String,

},
    { timestamps: true }
);