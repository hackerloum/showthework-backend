import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import models first
import './models/Image.js';
import './models/AccessCode.js';
import './models/Analytics.js';

// Then import routes
import imagesRouter from './routes/images.js';
import accessCodesRouter from './routes/accessCodes.js';
import analyticsRouter from './routes/analytics.js';

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            /\.netlify\.app$/,  // Allow all Netlify default domains
            /\.onrender\.com$/, // Allow all Render.com domains
            'http://localhost:3000',
            'http://localhost:5000'
          ]
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
            frameSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "http:", "data:"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 50,
    minPoolSize: 0
})
.then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongooseServerSelectionError') {
        console.error('Connection failed. Please verify:');
        console.error('1. Network connectivity to MongoDB Atlas servers');
        console.error('2. Database credentials are correct');
        console.error('3. Database name and replica set are correct');
    }
    process.exit(1);
});

// Routes
app.use('/api/images', imagesRouter);
app.use('/api/access-codes', accessCodesRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error caught in middleware:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    const serverAddress = server.address();
    console.log(`Server running at http://${serverAddress.address === '0.0.0.0' ? 'localhost' : serverAddress.address}:${serverAddress.port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Full server address:', serverAddress);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Closing server...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing server...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
}); 
