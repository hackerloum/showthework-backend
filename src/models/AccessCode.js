import mongoose from 'mongoose';

const accessCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    expiry: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isUsed: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model('AccessCode', accessCodeSchema); 
