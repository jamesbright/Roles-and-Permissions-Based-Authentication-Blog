import * as mongoose from 'mongoose';

interface BlogI extends mongoose.Document {
    title: string,
    content: string,
    imageURL: string,
    imageId: string,
    author: Array<string>,
    comments: Array<string>,
    likes: Array<string>,
    views: number
    
}

export { BlogI }
