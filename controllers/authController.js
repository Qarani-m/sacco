const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

exports.showLogin = (req, res) => {
    res.render('auth/login');
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/login', { 
                error: errors.array()[0].msg,
                title: 'Login'
            });
        }

        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.render('auth/login', { 
                error: 'Invalid credentials',
                title: 'Login'
            });
        }

        if (!user.is_active) {
            return res.render('auth/login', { 
                error: 'Account is deactivated',
                title: 'Login'
            });
        }

        const isValid = await User.verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.render('auth/login', { 
                error: 'Invalid credentials',
                title: 'Login'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, full_name: user.full_name, registration_paid: user.registration_paid },
            process.env.JWT_SECRET || "a strong secret",
            { expiresIn: '7d' }
        );

        // Set JWT in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/members/dashboard';
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', { 
            error: 'Login failed',
            title: 'Login'
        });
    }
};
exports.showRegister = (req, res) => {
    res.render('auth/register');
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/register', { 
                error: errors.array()[0].msg,
                title: 'Register'
            });
        }

        const { email, password, full_name, phone_number, role } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = await User.create({
            email,
            password,
            full_name,
            phone_number,
            role: role || 'member'
        });

        // Generate verification token
        const { token: verificationToken } = await User.generateVerificationToken(user.id);
        
        // Send verification email
        await emailService.sendVerificationEmail(user.email, verificationToken, user.full_name);

        // Create session token
        const sessionToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role, full_name: user.full_name, registration_paid: user.registration_paid },
            process.env.JWT_SECRET || "a strong secret",
            { expiresIn: '7d' }
        );

        // Set JWT in HTTP-only cookie
        res.cookie('token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Redirect to verification page instead of dashboard
        return res.redirect('/auth/verify-email');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.logout = (req, res) => {
    // Clear JWT cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    
    // Redirect to login page
    res.redirect('/auth/login');
};

exports.showForgotPassword = (req, res) => {
    res.render('auth/forgot-password');
};

exports.forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // TODO: Send email with reset link
        // For now, return token (in production, send via email)
        res.json({
            success: true,
            message: 'Password reset link sent to email',
            resetToken // Remove in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};

exports.showResetPassword = (req, res) => {
    res.render('auth/reset-password', { token: req.params.token });
};

exports.resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { token } = req.params;
        const { password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.updatePassword(decoded.id, password);

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

// Show verify email page
exports.showVerifyEmail = (req, res) => {
    res.render('auth/verify-email', { title: 'Verify Email' });
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify the email
        const user = await User.verifyEmail(token);
        
        // Render success page
        res.render('auth/email-verified', { 
            title: 'Email Verified',
            userName: user.full_name
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.render('auth/verify-email', {
            title: 'Verify Email',
            error: error.message || 'Invalid or expired verification link'
        });
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        const { token, user } = await User.resendVerificationToken(email);
        
        // Send verification email
        await emailService.sendVerificationEmail(user.email, token, user.full_name);
        
        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to resend verification email' 
        });
    }
};