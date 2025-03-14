import mongoose from 'mongoose';

const accessCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date
    }
}, {
    timestamps: true
});

// Pre-save middleware to ensure code is unique
accessCodeSchema.pre('save', async function(next) {
    if (this.isNew) {
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            const existingCode = await mongoose.model('AccessCode').findOne({ code: this.code });
            if (!existingCode) {
                isUnique = true;
            } else {
                this.code = Math.random().toString(36).substring(2, 15);
                attempts++;
            }
        }

        if (!isUnique) {
            next(new Error('Could not generate unique access code after multiple attempts'));
            return;
        }
    }
    next();
});

// Method to check if code is expired
accessCodeSchema.methods.isExpired = function() {
    return new Date() > this.expiryDate;
};

// Method to increment usage count
accessCodeSchema.methods.incrementUsage = async function() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    return this.save();
};

// Virtual for time until expiry
accessCodeSchema.virtual('timeUntilExpiry').get(function() {
    return this.expiryDate - new Date();
});

// Ensure virtuals are included in JSON output
accessCodeSchema.set('toJSON', { virtuals: true });
accessCodeSchema.set('toObject', { virtuals: true });

mongoose.model('AccessCode', accessCodeSchema); 
