
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const TrashSchema = new Schema({
    collectionName:  String,
    collectionObject: Object,
    
    
    
  
},{ timestamps: true}
);