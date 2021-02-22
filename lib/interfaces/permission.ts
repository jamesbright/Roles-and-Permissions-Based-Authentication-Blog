import * as mongoose from 'mongoose';
interface PermissionI extends mongoose.Document {
    
    name: String,
    createdAt: {
        type: Date
        
    },
    updatedAt: {
        type: Date
       
    }
}
export { PermissionI }