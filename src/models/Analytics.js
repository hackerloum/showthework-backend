import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        enum: ['view', 'download', 'access_code_used', 'error']
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    accessCodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessCode'
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        referrer: String,
        path: String,
        statusCode: Number,
        errorMessage: String,
        browser: String,
        os: String,
        device: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ imageId: 1, timestamp: -1 });
analyticsSchema.index({ accessCodeId: 1, timestamp: -1 });

// Static method to log an event
analyticsSchema.statics.logEvent = async function(eventData) {
    try {
        const analytics = new this(eventData);
        return await analytics.save();
    } catch (error) {
        console.error('Error logging analytics event:', error);
        throw error;
    }
};

// Static method to get event counts by type
analyticsSchema.statics.getEventCounts = async function(startDate, endDate) {
    try {
        return await this.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 }
                }
            }
        ]);
    } catch (error) {
        console.error('Error getting event counts:', error);
        throw error;
    }
};

// Static method to get top viewed images
analyticsSchema.statics.getTopViewedImages = async function(limit = 10) {
    try {
        return await this.aggregate([
            {
                $match: {
                    eventType: 'view',
                    imageId: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$imageId',
                    views: { $sum: 1 }
                }
            },
            {
                $sort: { views: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'images',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'image'
                }
            },
            {
                $unwind: '$image'
            }
        ]);
    } catch (error) {
        console.error('Error getting top viewed images:', error);
        throw error;
    }
};

mongoose.model('Analytics', analyticsSchema); 
