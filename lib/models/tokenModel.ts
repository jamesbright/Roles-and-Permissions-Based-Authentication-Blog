import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const TokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600// expires in 1 hour
    },
});