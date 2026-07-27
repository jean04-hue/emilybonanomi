const express = require('express');
const cors = require('cors');

// ===== Rotas existentes =====
const authRoutes            = require('./routes/auth.routes');
const profileRoutes         = require('./routes/profile.routes');
const addressRoutes         = require('./routes/address.routes');
const productRoutes         = require('./routes/product.routes');
const searchRoutes          = require('./routes/search.routes');
const productImageRoutes    = require('./routes/product-image.routes');
const adminProductRoutes    = require('./routes/admin-product.routes');
const adminCategoryRoutes   = require('./routes/admin-category.routes');
const adminStockRoutes      = require('./routes/admin-stock.routes');
const cartRoutes            = require('./routes/cart.routes');
const orderRoutes           = require('./routes/order.routes');
const orderListRoutes       = require('./routes/order-list.routes');
const webhookRoutes         = require('./routes/webhook.routes');
const paymentRoutes         = require('./routes/payment.routes');

// ===== Rotas novas (finalização) =====
const favoriteRoutes        = require('./routes/favorite.routes');
const reviewRoutes          = require('./routes/review.routes');
const dashboardRoutes       = require('./routes/dashboard.routes');
const adminOrderRoutes      = require('./routes/admin-order.routes');
const adminUserRoutes       = require('./routes/admin-user.routes');
const publicCategoryRoutes  = require('./routes/category.routes');
const adminReviewRoutes     = require('./routes/admin-review.routes');
const variationRoutes       = require('./routes/variation.routes');

const app = express();

// CORS — em produção FRONTEND_URL = lista separada por vírgula
const allowedOrigins = (process.env.FRONTEND_URL || '*')
    .split(',')
    .map(s => s.trim());

app.use(cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    console.log('METHOD:', req.method);
    console.log('URL:', req.url);
    console.log('CONTENT-TYPE:', req.headers['content-type']);
    console.log('BODY:', req.body);
    next();
});

// Health-check (para pings do cron-job.org evitando cold start no Render free)
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/', (_req, res) => res.json({
    projeto: 'Emily_Bonanomi',
    status: 'online',
    versao: '2.0'
}));

// Públicas
app.use('/api/auth',        authRoutes);
app.use('/api/categories',  publicCategoryRoutes);
app.use('/api/products',    searchRoutes);
app.use('/api/products',    productImageRoutes);
app.use('/api/products',    variationRoutes);
app.use('/api/products',    reviewRoutes);   // /api/products/:id/reviews
app.use('/api/products',    productRoutes);

// Autenticadas (cliente)
app.use('/api/profile',     profileRoutes);
app.use('/api/addresses',   addressRoutes);

// Alias compatibilidade
app.use('/api/customer/addresses', addressRoutes);

app.use('/api/cart',        cartRoutes);
app.use('/api/favorites',   favoriteRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/orders',      orderListRoutes);

// Admin
app.use('/api/admin/products',   adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/stock',      adminStockRoutes);
app.use('/api/admin/orders',     adminOrderRoutes);
app.use('/api/admin/users',      adminUserRoutes);
app.use('/api/admin/reviews',    adminReviewRoutes);
app.use('/api/admin/dashboard',  dashboardRoutes);

// Webhook Mercado Pago (rota pública, sem auth)
app.use('/api/payments',  paymentRoutes);
app.use('/api/webhook',  webhookRoutes);
app.use('/api/payments/webhook', webhookRoutes); // alias usado em deploy

// 404 padrão
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Erro global
app.use((err, _req, res, _next) => {
    console.error('[ERRO]', err);
    res.status(500).json({ erro: err.message || 'Erro interno' });
});

module.exports = app;
