const express = require('express');
const session = require('express-session');
const flash = require('connect-flash'); // ADD THIS
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const memberRoutes = require('./routes/members');
const shareRoutes = require('./routes/shares');
const loanRoutes = require('./routes/loans');
const guarantorRoutes = require('./routes/guarantors');
const welfareRoutes = require('./routes/welfare');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csurf = require('csurf');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        },
    },
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'dist')))
app.use(ejsLayouts);
app.set('layout', 'layouts/main');
app.use(cookieParser());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'css')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sacco-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash middleware - ADD THIS AFTER SESSION
app.use(flash());

// CSRF Protection
app.use(csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } }));

// Make user and flash messages available to all views
app.use(async (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.user = null;
    res.locals.isAdmin = false;
    res.locals.currentPath = req.path;
    
    // ADD FLASH MESSAGES TO LOCALS
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    const token = req.cookies.token;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || "a strong secret");
            const user = await User.findById(payload.id);
            if (user) {
                res.locals.user = user;
                res.locals.isAdmin = user.role === 'admin';
            }
        } catch (err) {
            // Invalid token, ignore
        }
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/members', memberRoutes);
app.use('/shares', shareRoutes);
app.use('/loans', loanRoutes);
app.use('/guarantors', guarantorRoutes);
app.use('/welfare', welfareRoutes);
app.use('/payments', paymentRoutes);
app.use('/messages', messageRoutes);
app.use('/reports', reportRoutes);

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        }
        return res.redirect('/members/dashboard');
    }
    res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('errors/404', {
        title: 'Page Not Found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('errors/500', {
        title: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SACCO System running on port ${PORT}`);
});

module.exports = app;