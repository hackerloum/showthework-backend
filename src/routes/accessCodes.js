import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const AccessCode = mongoose.model('AccessCode');

// Create a new access code
router.post('/', async (req, res) => {
    try {
        const { expiryDate } = req.body;
        
        if (!expiryDate) {
            return res.status(400).json({ error: 'Expiry date is required' });
        }

        const accessCode = new AccessCode({
            code: Math.random().toString(36).substring(2, 15),
            expiryDate: new Date(expiryDate),
            isActive: true
        });

        await accessCode.save();
        res.status(201).json(accessCode);
    } catch (error) {
        console.error('Error creating access code:', error);
        res.status(500).json({ error: 'Error creating access code' });
    }
});

// Get all access codes
router.get('/', async (req, res) => {
    try {
        const accessCodes = await AccessCode.find().sort({ createdAt: -1 });
        res.json(accessCodes);
    } catch (error) {
        console.error('Error fetching access codes:', error);
        res.status(500).json({ error: 'Error fetching access codes' });
    }
});

// Validate an access code
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Access code is required' });
        }

        const accessCode = await AccessCode.findOne({ code, isActive: true });
        
        if (!accessCode) {
            return res.status(404).json({ error: 'Invalid access code' });
        }

        const now = new Date();
        if (now > accessCode.expiryDate) {
            accessCode.isActive = false;
            await accessCode.save();
            return res.status(400).json({ error: 'Access code has expired' });
        }

        res.json({ valid: true, accessCode });
    } catch (error) {
        console.error('Error validating access code:', error);
        res.status(500).json({ error: 'Error validating access code' });
    }
});

// Deactivate an access code
router.patch('/:id/deactivate', async (req, res) => {
    try {
        const accessCode = await AccessCode.findById(req.params.id);
        
        if (!accessCode) {
            return res.status(404).json({ error: 'Access code not found' });
        }

        accessCode.isActive = false;
        await accessCode.save();
        
        res.json(accessCode);
    } catch (error) {
        console.error('Error deactivating access code:', error);
        res.status(500).json({ error: 'Error deactivating access code' });
    }
});

// Delete an access code
router.delete('/:id', async (req, res) => {
    try {
        const accessCode = await AccessCode.findByIdAndDelete(req.params.id);
        
        if (!accessCode) {
            return res.status(404).json({ error: 'Access code not found' });
        }

        res.json({ message: 'Access code deleted successfully' });
    } catch (error) {
        console.error('Error deleting access code:', error);
        res.status(500).json({ error: 'Error deleting access code' });
    }
});

export default router; 
