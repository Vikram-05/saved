import mongoose from "mongoose";

const DataModel = mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true 
    },
    data: { 
        type: String, 
        required: true 
    },
    type: {
        type: String,
        enum: ['text', 'file'],
        required: true,
        default: 'text'
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 2592000 
    }
});

export default mongoose.model("Data", DataModel);