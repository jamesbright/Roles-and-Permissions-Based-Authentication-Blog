import * as mongoose from 'mongoose';
import { BlogI } from '../interfaces/blog';

const Schema = mongoose.Schema;
export const BlogSchema = new Schema({
    title: {
        type: String,
        index: true,
        required: true

    },
    content: {
        type: String,
        index: true,
        required: true

    },
    imageURL: {
        type: String,
        required: true

    },
    imageId: {
        type: String,
        required: true
    },
    author: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
    

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            index: true

        }
    ],

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like",
            index: true

        }
    ],

    views:
    {
        type: Number,
        default :0
        
    }

}, { timestamps: true });


