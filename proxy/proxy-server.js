import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan'; // For logging
import rateLimit from 'express-rate-limit'; // For rate limiting

const app = express();

// Setup logging with morgan
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter); // Apply rate limiter to all routes

// Middleware to forward the original client IP
app.use((req, res, next) => {
    req.headers['X-Forwarded-For'] = req.ip;
    next();
});

// Reverse proxy routes
app.use('/products', createProxyMiddleware({
    target: 'http://product-service:4000',  // Change to service name and port
    changeOrigin: true,
    onProxyReq: (proxyRes, req) => {
        proxyRes.headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    },
}));

app.use('/cart', createProxyMiddleware({
    target: 'http://cart-service:4001',  // Change to service name and port
    changeOrigin: true,
    onProxyReq: (proxyRes, req) => {
        proxyRes.headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    },
}));

app.use('/orders', createProxyMiddleware({
    target: 'http://order-service:4002',  // Change to service name and port
    changeOrigin: true,
    onProxyReq: (proxyRes, req) => {
        proxyRes.headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    },
}));

// Default route
app.get('/', (req, res) => {
    res.send('Reverse Proxy Server is running');
});

// Start the reverse proxy server
const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Reverse proxy server running at http://localhost:${PORT}`);
});
