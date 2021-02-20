import * as mongoose from 'mongoose';
interface RoleI extends mongoose.Document {
    
    name: String,
    createdAt: {
        type: Date
        
    },
    updatedAt: {
        type: Date
       
    }
}
export { RoleI }