import * as mongoose from 'mongoose';
interface RoleI extends mongoose.Document {
    
    name: String,
    createdAt: {
        type: Date
        
    },
       permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }
    ],
    updatedAt: {
        type: Date
       
    }
}
export { RoleI }