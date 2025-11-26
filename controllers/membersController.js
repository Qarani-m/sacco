const User = require('../models/User');
const Share = require('../models/Share');
const Loan = require('../models/Loan');
const Savings = require('../models/Savings');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');

const Message = require('../models/Message');

exports.showDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch all required data
        const stats = await User.getStats(userId);
        const recentTransactions = await Transaction.getByUser(userId);
        const unreadNotifications = await Notification.getUnreadCount(userId);
        const unreadMessages = await Message.getUnreadCount(userId);
        const activeLoans = await Loan.getByUser(userId, 'active');
        
        // Fetch recent notifications and messages for preview
        const notifications = await Notification.getByUser(userId, false);
        const messages = await Message.getByUser(userId);
        
        // Get welfare payments count
        const WelfarePayment = require('../models/WelfarePayment');
        const welfarePayments = await WelfarePayment.getByUser(userId);
        
        // Get pending guarantor requests
        const LoanGuarantor = require('../models/LoanGuarantor');
        const pendingGuarantorRequests = await LoanGuarantor.getPendingByGuarantor(userId);

        res.render('member/dashboard', {
            title: 'Dashboard',
            user: req.user,
            stats: {
                total_shares: stats.total_shares || 0,
                total_savings: parseFloat(stats.total_savings) || 0,
                active_loans: stats.active_loans || 0,
                loan_balance: parseFloat(stats.loan_balance) || 0,
                welfare_payments: welfarePayments.length || 0,
                pending_guarantor_requests: pendingGuarantorRequests.length || 0
            },
            recent_transactions: recentTransactions.slice(0, 5) || [],
            unreadNotifications: unreadNotifications || 0,
            unreadMessages: unreadMessages || 0,
            active_loans: activeLoans || [],
            notifications: notifications || [],
            messages: messages || []
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Failed to load dashboard');
    }
};

exports.showRegistrationPage = async (req, res) => {
    try {
        res.json({
            success: true,
            registration_fee: 1000,
            message: 'Please pay KSh 1,000 registration fee to access SACCO features'
        });
    } catch (error) {
        console.error('Show registration page error:', error);
        res.status(500).json({ error: 'Failed to load page' });
    }
};

exports.payRegistrationFee = async (req, res) => {
    try {
        const userId = req.user.id;
        const amount = 1000;
        const transactionRef = `REG${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        const user = await User.findById(userId);
        if (user.registration_paid) {
            return res.status(400).json({ error: 'Registration fee already paid' });
        }

        await Transaction.create({
            user_id: userId,
            amount,
            type: 'registration',
            payment_method: 'mpesa',
            transaction_ref: transactionRef,
            status: 'pending'
        });

        res.json({
            success: true,
            message: 'Check your phone for M-Pesa prompt',
            amount,
            transaction_ref: transactionRef
        });
    } catch (error) {
        console.error('Pay registration fee error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

exports.showProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: user.role,
                is_active: user.is_active,
                registration_paid: user.registration_paid,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Show profile error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone_number } = req.body;

        const updatedUser = await User.update(userId, { full_name, phone_number });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

exports.listNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only } = req.query;

        const notifications = await Notification.getByUser(userId, unread_only === 'true');
        const unreadCount = await Notification.getUnreadCount(userId);

        res.json({
            success: true,
            notifications,
            unread_count: unreadCount
        });
    } catch (error) {
        console.error('List notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.markAsRead(notificationId);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to mark notification' });
    }
};

exports.viewSavings = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentYear = new Date().getFullYear();

        const yearlyReport = await Savings.getYearlyReport(userId, currentYear);

        res.json({
            success: true,
            savings: {
                previous_years: yearlyReport.previous_savings,
                current_year: yearlyReport.current_year_savings,
                total: yearlyReport.total_savings
            }
        });
    } catch (error) {
        console.error('View savings error:', error);
        res.status(500).json({ error: 'Failed to fetch savings' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { document_type, file_path } = req.body;

        // Validate document type
        if (!['id_front', 'id_back'].includes(document_type)) {
            return res.status(400).json({ error: 'Invalid document type' });
        }

        const Document = require('../models/Document');
        const document = await Document.create({
            user_id: userId,
            document_type,
            file_path
        });

        // Notify admins
        const admins = await User.getAllAdmins();
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            type: 'document_upload',
            title: 'New Document Upload',
            message: `${req.user.full_name} uploaded ${document_type}`,
            related_entity_type: 'document',
            related_entity_id: document.id
        }));
        await Notification.createBulk(notifications);

        res.json({
            success: true,
            message: 'Document uploaded successfully. Awaiting admin verification',
            document
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

exports.viewDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const Document = require('../models/Document');
        const documents = await Document.findByUserId(userId);

        res.json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('View documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

exports.listNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.getByUser(userId, false);

        res.json({
            success: true,
            notifications: notifications || []
        });
    } catch (error) {
        console.error('List notifications error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch notifications' 
        });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.markAsRead(notificationId);

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to mark notification as read' 
        });
    }
};

// Additional imports for new features
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
    limits: { fileSize: 5 * 1024 * 1024 },
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

        if (req.user.registration_paid) {
            return res.json({ success: false, error: 'Registration fee already paid' });
        }

        const amount = 1000;
        const transactionRef = `REG${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

        await Transaction.create({
            user_id: userId,
            amount,
            type: 'registration_fee',
            payment_method: 'mpesa',
            transaction_ref: transactionRef,
            status: 'completed'
        });

        await User.update(userId, { 
            registration_paid: true,
            registration_payment_date: new Date()
        });

        res.json({
            success: true,
            message: 'Registration fee paid successfully!',
            transaction_ref: transactionRef
        });
    } catch (error) {
        console.error('Pay registration fee error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

// Show profile page
exports.showProfilePage = async (req, res) => {
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

            await Document.create({
                user_id: userId,
                document_type: 'id_front',
                file_path: req.files.id_front[0].path,
                file_name: req.files.id_front[0].filename
            });

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