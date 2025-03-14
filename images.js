import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const Image = mongoose.model('Image');

// Get all images
router.get('/', async (req, res) => {
    try {
        const images = await Image.find({});
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single image
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json(image);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new image
router.post('/', async (req, res) => {
    try {
        const image = new Image(req.body);
        await image.save();
        res.status(201).json(image);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update image
router.put('/:id', async (req, res) => {
    try {
        const image = await Image.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json(image);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete image
router.delete('/:id', async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete(req.params.id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 
