import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const Analytics = mongoose.model('Analytics');

// Get analytics data
router.get('/', async (req, res) => {
    try {
        const analytics = await Analytics.find({});
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record new analytics event
router.post('/', async (req, res) => {
    try {
        const analytics = new Analytics(req.body);
        await analytics.save();
        res.status(201).json(analytics);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 
