// Append these methods to membersController.js

const Document = require('../models/Document');
const MemberProfile = require('../models/MemberProfile');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/documents/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed'));
        }
    }
});

// Show registration fee page
exports.showRegistrationFeePage = async (req, res) => {
    try {
        if (req.user.registration_paid) {
            return res.redirect('/members/dashboard');
        }

        res.render('member/registration-fee', {
            title: 'Registration Fee',
            user: req.user,
            unreadNotifications: 0,
            unreadMessages: 0
        });
    } catch (error) {
        console.error('Show registration fee page error:', error);
        res.status(500).send('Failed to load registration page');
    }
};

// Pay registration fee
exports.payRegistrationFee = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if already paid
        if (req.user.registration_paid) {
            return res.json({ success: false, error: 'Registration fee already paid' });
        }

        const amount = 1000;
        const transactionRef = `REG${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        // Create transaction
        const Transaction = require('../models/Transaction');
        await Transaction.create({
            user_id: userId,
            amount,
            type: 'registration_fee',
            payment_method: 'mpesa',
            transaction_ref: transactionRef,
            status: 'pending'
        });

        // TODO: Integrate with actual M-Pesa API
        // For now, simulate success
        
        // Update user registration status
        await User.update(userId, { 
            registration_paid: true,
            registration_payment_date: new Date()
        });

        res.json({
            success: true,
            message: 'Check your phone for M-Pesa prompt',
            transaction_ref: transactionRef
        });
    } catch (error) {
        console.error('Pay registration fee error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

// Show profile page
exports.showProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await Document.findByUserId(userId);
        const profileForm = await MemberProfile.findByUserId(userId);

        res.render('member/profile', {
            title: 'My Profile',
            user: req.user,
            unreadNotifications: 0,
            unreadMessages: 0,
            documents: documents || [],
            profileForm: profileForm || null
        });
    } catch (error) {
        console.error('Show profile error:', error);
        res.status(500).send('Failed to load profile page');
    }
};

// Upload documents
exports.uploadDocuments = [
    upload.fields([
        { name: 'id_front', maxCount: 1 },
        { name: 'id_back', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const userId = req.user.id;

            if (!req.files || !req.files.id_front || !req.files.id_back) {
                return res.status(400).json({ error: 'Both ID front and back are required' });
            }

            // Save front document
            await Document.create({
                user_id: userId,
                document_type: 'id_front',
                file_path: req.files.id_front[0].path,
                file_name: req.files.id_front[0].filename
            });

            // Save back document
            await Document.create({
                user_id: userId,
                document_type: 'id_back',
                file_path: req.files.id_back[0].path,
                file_name: req.files.id_back[0].filename
            });

            res.json({
                success: true,
                message: 'Documents uploaded successfully'
            });
        } catch (error) {
            console.error('Upload documents error:', error);
            res.status(500).json({ error: 'Failed to upload documents' });
        }
    }
];

// Submit profile form
exports.submitProfileForm = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if already submitted
        const exists = await MemberProfile.exists(userId);
        if (exists) {
            return res.json({ success: false, error: 'Profile form already submitted' });
        }

        const profileData = {
            user_id: userId,
            ...req.body
        };

        await MemberProfile.create(profileData);

        res.json({
            success: true,
            message: 'Profile form submitted successfully'
        });
    } catch (error) {
        console.error('Submit profile form error:', error);
        res.status(500).json({ error: 'Failed to submit profile form' });
    }
};

// Show loan request page
exports.showLoanRequestPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalShares = await Share.getTotalByUser(userId);
        const availableShares = await Share.getAvailableByUser(userId);

        res.render('member/loan-request', {
            title: 'Request Loan',
            user: req.user,
            unreadNotifications: 0,
            unreadMessages: 0,
            totalShares: totalShares || 0,
            availableShares: availableShares || 0
        });
    } catch (error) {
        console.error('Show loan request page error:', error);
        res.status(500).send('Failed to load loan request page');
    }
};

module.exports = exports;
