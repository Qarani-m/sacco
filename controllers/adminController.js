const AdminAction = require('../models/AdminAction');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Share = require('../models/Share');
const WelfarePayment = require('../models/WelfarePayment');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

exports.showDashboard = async (req, res) => {
    try {
        // Get overview statistics
        const db = require('../models/db');
        
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'member' AND is_active = true) as total_members,
                (SELECT COUNT(*) FROM loans WHERE status = 'pending') as pending_loans,
                (SELECT COUNT(*) FROM admin_actions WHERE status = 'pending') as pending_actions,
                (SELECT COUNT(*) FROM loans WHERE status = 'active') as active_loans,
                (SELECT COALESCE(SUM(quantity * 1000), 0) FROM shares) as total_shares_value,
                (SELECT COALESCE(SUM(balance_remaining), 0) FROM loans WHERE status = 'active') as total_loan_balance
        `);

        res.json({
            success: true,
            stats: stats.rows[0]
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

exports.showPendingActions = async (req, res) => {
    try {
        const pendingActions = await AdminAction.getPending();

        // Get verifications for each action
        for (let action of pendingActions) {
            action.verifications = await AdminAction.getVerifications(action.id);
        }

        res.json({
            success: true,
            pending_actions: pendingActions
        });
    } catch (error) {
        console.error('Pending actions error:', error);
        res.status(500).json({ error: 'Failed to fetch pending actions' });
    }
};

exports.initiateAction = async (req, res) => {
    try {
        const { action_type, entity_type, entity_id, reason, action_data } = req.body;
        const adminId = req.user.id;

        // Create admin action
        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type,
            entity_type,
            entity_id,
            reason,
            action_data
        });

        // Notify other admins
        const admins = await User.getAllAdmins();
        const notifications = admins
            .filter(admin => admin.id !== adminId)
            .map(admin => ({
                user_id: admin.id,
                type: 'admin_action',
                title: 'New Admin Action Requires Approval',
                message: `${req.user.full_name} initiated ${action_type} on ${entity_type}. Reason: ${reason}`,
                related_entity_type: 'admin_action',
                related_entity_id: action.id
            }));

        if (notifications.length > 0) {
            await Notification.createBulk(notifications);
        }

        res.json({
            success: true,
            message: 'Action initiated. Requires 2/3 admin approval',
            action
        });
    } catch (error) {
        console.error('Initiate action error:', error);
        res.status(500).json({ error: 'Failed to initiate action' });
    }
};

exports.verifyAction = async (req, res) => {
    try {
        const { actionId } = req.params;
        const { decision, comment } = req.body;
        const verifierId = req.user.id;

        const action = await AdminAction.findById(actionId);
        if (!action) {
            return res.status(404).json({ error: 'Action not found' });
        }

        if (action.status !== 'pending') {
            return res.status(400).json({ error: 'Action already processed' });
        }

        if (action.initiated_by === verifierId) {
            return res.status(400).json({ error: 'Cannot verify your own action' });
        }

        // Check if already verified
        const hasVerified = await AdminAction.hasVerified(actionId, verifierId);
        if (hasVerified) {
            return res.status(400).json({ error: 'You have already verified this action' });
        }

        // Add verification
        await AdminAction.addVerification({
            action_id: actionId,
            verifier_id: verifierId,
            decision,
            comment
        });

        // Count approvals and rejections
        const approvals = await AdminAction.countApprovals(actionId);
        const rejections = await AdminAction.countRejections(actionId);

        // Check if we have 2/3 majority
        if (approvals >= 2) {
            // Approve and execute action
            await AdminAction.updateStatus(actionId, 'approved');
            await executeAdminAction(action);

            return res.json({
                success: true,
                message: 'Action approved and executed',
                status: 'approved'
            });
        } else if (rejections >= 2) {
            // Reject action
            await AdminAction.updateStatus(actionId, 'rejected');

            return res.json({
                success: true,
                message: 'Action rejected',
                status: 'rejected'
            });
        }

        res.json({
            success: true,
            message: 'Verification recorded. Waiting for more approvals',
            approvals,
            rejections,
            needed: 2
        });
    } catch (error) {
        console.error('Verify action error:', error);
        res.status(500).json({ error: 'Failed to verify action' });
    }
};

async function executeAdminAction(action) {
    const { action_type, entity_type, entity_id, action_data } = action;

    try {
        switch (entity_type) {
            case 'user':
                if (action_type === 'update') {
                    if (action_data.is_active === false) {
                        await User.deactivate(entity_id);
                    } else if (action_data.is_active === true) {
                        await User.activate(entity_id);
                    }
                }
                break;

            case 'loan':
                if (action_type === 'update') {
                    if (action_data.status === 'approved') {
                        await Loan.approve(entity_id, action_data.approved_amount);
                    } else if (action_data.status === 'rejected') {
                        await Loan.reject(entity_id);
                    }
                }
                break;

            case 'payment_transaction':
                if (action_type === 'update' && action_data.status === 'completed') {
                    const Transaction = require('../models/Transaction');
                    await Transaction.updateStatus(action_data.transaction_ref, 'completed');
                }
                break;

            default:
                console.log('Unknown entity type:', entity_type);
        }
    } catch (error) {
        console.error('Execute action error:', error);
        throw error;
    }
}

exports.showActionsHistory = async (req, res) => {
    try {
        const { status, initiated_by } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (initiated_by) filters.initiated_by = initiated_by;

        const history = await AdminAction.getHistory(filters);

        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Actions history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.listMembers = async (req, res) => {
    try {
        const { role, is_active, registration_paid } = req.query;
        
        const filters = {};
        if (role) filters.role = role;
        if (is_active !== undefined) filters.is_active = is_active === 'true';
        if (registration_paid !== undefined) filters.registration_paid = registration_paid === 'true';

        const members = await User.getAllMembers(filters);

        res.json({
            success: true,
            members
        });
    } catch (error) {
        console.error('List members error:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};

exports.viewMember = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const stats = await User.getStats(userId);
        const loans = await Loan.getByUser(userId);
        const shares = await Share.getHistory(userId);

        res.json({
            success: true,
            user,
            stats,
            loans,
            shares
        });
    } catch (error) {
        console.error('View member error:', error);
        res.status(500).json({ error: 'Failed to fetch member details' });
    }
};

exports.deactivateMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type: 'update',
            entity_type: 'user',
            entity_id: userId,
            reason,
            action_data: { is_active: false }
        });

        // Notify other admins
        const admins = await User.getAllAdmins();
        const notifications = admins
            .filter(admin => admin.id !== adminId)
            .map(admin => ({
                user_id: admin.id,
                type: 'admin_action',
                title: 'Member Deactivation Requires Approval',
                message: `${req.user.full_name} wants to deactivate a member. Reason: ${reason}`,
                related_entity_type: 'admin_action',
                related_entity_id: action.id
            }));

        if (notifications.length > 0) {
            await Notification.createBulk(notifications);
        }

        res.json({
            success: true,
            message: 'Deactivation initiated. Requires 2/3 admin approval',
            action
        });
    } catch (error) {
        console.error('Deactivate member error:', error);
        res.status(500).json({ error: 'Failed to deactivate member' });
    }
};

exports.activateMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type: 'update',
            entity_type: 'user',
            entity_id: userId,
            reason,
            action_data: { is_active: true }
        });

        res.json({
            success: true,
            message: 'Activation initiated. Requires 2/3 admin approval',
            action
        });
    } catch (error) {
        console.error('Activate member error:', error);
        res.status(500).json({ error: 'Failed to activate member' });
    }
};

exports.listLoans = async (req, res) => {
    try {
        const { status, borrower_id } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (borrower_id) filters.borrower_id = borrower_id;

        const loans = await Loan.getAll(filters);

        res.json({
            success: true,
            loans
        });
    } catch (error) {
        console.error('List loans error:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

exports.viewLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        
        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        const LoanGuarantor = require('../models/LoanGuarantor');
        const LoanRepayment = require('../models/LoanRepayment');
        
        const guarantors = await LoanGuarantor.getByLoan(loanId);
        const repayments = await LoanRepayment.getByLoan(loanId);
        const schedule = Loan.calculateRepaymentSchedule(
            loan.approved_amount || loan.requested_amount,
            loan.interest_rate,
            loan.repayment_months
        );

        res.json({
            success: true,
            loan,
            guarantors,
            repayments,
            schedule
        });
    } catch (error) {
        console.error('View loan error:', error);
        res.status(500).json({ error: 'Failed to fetch loan details' });
    }
};

exports.approveLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { approved_amount, reason } = req.body;
        const adminId = req.user.id;

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Check if admin is the borrower
        if (loan.borrower_id === adminId) {
            return res.status(403).json({ error: 'Cannot approve your own loan' });
        }

        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type: 'update',
            entity_type: 'loan',
            entity_id: loanId,
            reason,
            action_data: { status: 'approved', approved_amount }
        });

        res.json({
            success: true,
            message: 'Loan approval initiated. Requires 2/3 admin approval',
            action
        });
    } catch (error) {
        console.error('Approve loan error:', error);
        res.status(500).json({ error: 'Failed to approve loan' });
    }
};

exports.rejectLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        const action = await AdminAction.create({
            initiated_by: adminId,
            action_type: 'update',
            entity_type: 'loan',
            entity_id: loanId,
            reason,
            action_data: { status: 'rejected' }
        });

        res.json({
            success: true,
            message: 'Loan rejection initiated. Requires 2/3 admin approval',
            action
        });
    } catch (error) {
        console.error('Reject loan error:', error);
        res.status(500).json({ error: 'Failed to reject loan' });
    }
};

exports.listShares = async (req, res) => {
    try {
        const { user_id, status } = req.query;
        
        const filters = {};
        if (user_id) filters.user_id = user_id;
        if (status) filters.status = status;

        const shares = await Share.getAll(filters);

        res.json({
            success: true,
            shares
        });
    } catch (error) {
        console.error('List shares error:', error);
        res.status(500).json({ error: 'Failed to fetch shares' });
    }
};

exports.listWelfarePayments = async (req, res) => {
    try {
        const { user_id, start_date, end_date } = req.query;
        
        const filters = {};
        if (user_id) filters.user_id = user_id;
        if (start_date) filters.start_date = start_date;
        if (end_date) filters.end_date = end_date;

        const payments = await WelfarePayment.getAll(filters);

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('List welfare payments error:', error);
        res.status(500).json({ error: 'Failed to fetch welfare payments' });
    }
};

exports.showReports = async (req, res) => {
    try {
        res.json({
            success: true,
            available_reports: [
                'loans',
                'shares',
                'welfare',
                'savings',
                'sacco_savings'
            ]
        });
    } catch (error) {
        console.error('Show reports error:', error);
        res.status(500).json({ error: 'Failed to load reports' });
    }
};

exports.generateLoanReport = async (req, res) => {
    try {
        const { start_date, end_date, status } = req.body;
        
        const filters = {};
        if (status) filters.status = status;

        const loans = await Loan.getAll(filters);

        // Filter by date if provided
        let filteredLoans = loans;
        if (start_date || end_date) {
            filteredLoans = loans.filter(loan => {
                const loanDate = new Date(loan.created_at);
                if (start_date && loanDate < new Date(start_date)) return false;
                if (end_date && loanDate > new Date(end_date)) return false;
                return true;
            });
        }

        // Calculate statistics
        const totalLoaned = filteredLoans.reduce((sum, loan) => sum + parseFloat(loan.approved_amount || 0), 0);
        const totalBalance = filteredLoans.reduce((sum, loan) => sum + parseFloat(loan.balance_remaining || 0), 0);

        res.json({
            success: true,
            report: {
                loans: filteredLoans,
                statistics: {
                    total_loans: filteredLoans.length,
                    total_loaned: totalLoaned,
                    total_balance: totalBalance,
                    total_repaid: totalLoaned - totalBalance
                }
            }
        });
    } catch (error) {
        console.error('Generate loan report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.generateShareReport = async (req, res) => {
    try {
        const shares = await Share.getAll({});

        const db = require('../models/db');
        const summaryQuery = `
            SELECT 
                u.full_name,
                u.email,
                COALESCE(SUM(s.quantity), 0) as total_shares,
                COALESCE(SUM(s.amount_paid), 0) as total_value
            FROM users u
            LEFT JOIN shares s ON u.id = s.user_id
            WHERE u.role = 'member'
            GROUP BY u.id, u.full_name, u.email
            ORDER BY total_shares DESC
        `;
        
        const summary = await db.query(summaryQuery);

        res.json({
            success: true,
            report: {
                detailed_shares: shares,
                member_summary: summary.rows,
                statistics: {
                    total_shares: summary.rows.reduce((sum, row) => sum + parseInt(row.total_shares), 0),
                    total_value: summary.rows.reduce((sum, row) => sum + parseFloat(row.total_value), 0)
                }
            }
        });
    } catch (error) {
        console.error('Generate share report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.generateWelfareReport = async (req, res) => {
    try {
        const { year } = req.body;
        const targetYear = year || new Date().getFullYear();

        const report = await WelfarePayment.getYearlyReport(targetYear);
        const totalCollected = report.reduce((sum, row) => sum + parseFloat(row.total_paid), 0);

        res.json({
            success: true,
            report: {
                year: targetYear,
                member_contributions: report,
                statistics: {
                    total_members: report.length,
                    total_collected: totalCollected,
                    average_per_member: report.length > 0 ? totalCollected / report.length : 0
                }
            }
        });
    } catch (error) {
        console.error('Generate welfare report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.generateSavingsReport = async (req, res) => {
    try {
        const { year } = req.body;
        const currentYear = year || new Date().getFullYear();

        const db = require('../models/db');
        const query = `
            SELECT 
                u.full_name,
                u.email,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = u.id AND year < $1) as previous_savings,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = u.id AND year = $1) as current_year_savings,
                (SELECT COALESCE(SUM(amount), 0) FROM savings WHERE user_id = u.id) as total_savings
            FROM users u
            WHERE u.role = 'member' AND u.registration_paid = true
            ORDER BY total_savings DESC
        `;

        const result = await db.query(query, [currentYear]);

        res.json({
            success: true,
            report: {
                year: currentYear,
                member_savings: result.rows,
                statistics: {
                    total_members: result.rows.length,
                    total_previous: result.rows.reduce((sum, row) => sum + parseFloat(row.previous_savings), 0),
                    total_current_year: result.rows.reduce((sum, row) => sum + parseFloat(row.current_year_savings), 0),
                    grand_total: result.rows.reduce((sum, row) => sum + parseFloat(row.total_savings), 0)
                }
            }
        });
    } catch (error) {
        console.error('Generate savings report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.generateSaccoSavingsReport = async (req, res) => {
    try {
        const { year } = req.body;
        const SaccoSavings = require('../models/SaccoSavings');

        if (year) {
            const yearData = await SaccoSavings.getByYear(year);
            return res.json({
                success: true,
                report: {
                    year,
                    interest_collected: yearData ? yearData.total_interest_collected : 0
                }
            });
        }

        const db = require('../models/db');
        const allYears = await db.query('SELECT * FROM sacco_savings ORDER BY year DESC');
        const total = await SaccoSavings.getTotal();

        res.json({
            success: true,
            report: {
                yearly_breakdown: allYears.rows,
                total_sacco_savings: total
            }
        });
    } catch (error) {
        console.error('Generate SACCO savings report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

exports.listMessages = async (req, res) => {
    try {
        const adminId = req.user.id;
        const inbox = await Message.getInbox(adminId);
        const unreadCount = await Message.getUnreadCount(adminId);

        res.json({
            success: true,
            messages: inbox,
            unread_count: unreadCount
        });
    } catch (error) {
        console.error('List messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.viewMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const thread = await Message.getThread(messageId);

        if (thread.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await Message.markAsRead(messageId);

        res.json({
            success: true,
            thread
        });
    } catch (error) {
        console.error('View message error:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
};

exports.listPendingDocuments = async (req, res) => {
    try {
        const Document = require('../models/Document');
        const pendingDocs = await Document.findPending();

        res.json({
            success: true,
            documents: pendingDocs
        });
    } catch (error) {
        console.error('List pending documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

exports.verifyDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const adminId = req.user.id;
        const Document = require('../models/Document');

        const document = await Document.verify(documentId, adminId);

        // Notify user
        await Notification.create({
            user_id: document.user_id,
            type: 'document_verified',
            title: 'Document Verified',
            message: `Your ${document.document_type} has been verified`,
            related_entity_type: 'document',
            related_entity_id: documentId
        });

        res.json({
            success: true,
            message: 'Document verified successfully',
            document
        });
    } catch (error) {
        console.error('Verify document error:', error);
        res.status(500).json({ error: 'Failed to verify document' });
    }
};

exports.rejectDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;
        const Document = require('../models/Document');

        const document = await Document.reject(documentId, adminId, reason);

        // Notify user
        await Notification.create({
            user_id: document.user_id,
            type: 'document_rejected',
            title: 'Document Rejected',
            message: `Your ${document.document_type} was rejected. Reason: ${reason}`,
            related_entity_type: 'document',
            related_entity_id: documentId
        });

        res.json({
            success: true,
            message: 'Document rejected',
            document
        });
    } catch (error) {
        console.error('Reject document error:', error);
        res.status(500).json({ error: 'Failed to reject document' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { recipient_id, subject, body } = req.body;
        const senderId = req.user.id;

        const message = await Message.create({
            sender_id: senderId,
            recipient_id,
            subject,
            body
        });

        await Notification.create({
            user_id: recipient_id,
            type: 'new_message',
            title: 'New Message',
            message: `You have a new message from ${req.user.full_name}`,
            related_entity_type: 'message',
            related_entity_id: message.id
        });

        res.json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.replyMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { body } = req.body;
        const senderId = req.user.id;

        const parentMessage = await Message.findById(messageId);
        if (!parentMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const recipientId = parentMessage.sender_id === senderId ? 
            parentMessage.recipient_id : parentMessage.sender_id;

        const reply = await Message.create({
            sender_id: senderId,
            recipient_id: recipientId,
            subject: `Re: ${parentMessage.subject}`,
            body,
            parent_message_id: messageId
        });

        await Notification.create({
            user_id: recipientId,
            type: 'message_reply',
            title: 'New Reply',
            message: `${req.user.full_name} replied to your message`,
            related_entity_type: 'message',
            related_entity_id: reply.id
        });

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: reply
        });
    } catch (error) {
        console.error('Reply message error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

exports.sendReminders = async (req, res) => {
    try {
        const { reminder_type, member_ids, custom_message } = req.body;
        const adminId = req.user.id;

        let message = custom_message;
        let subject = 'Payment Reminder';

        if (!custom_message) {
            switch (reminder_type) {
                case 'loan':
                    subject = 'Loan Payment Reminder';
                    message = 'This is a reminder to make your loan payment. Please ensure timely payments to avoid penalties.';
                    break;
                case 'welfare':
                    subject = 'Welfare Payment Reminder';
                    message = 'Please pay your monthly welfare contribution of KSh 300.';
                    break;
                case 'shares':
                    subject = 'Share Purchase Reminder';
                    message = 'Consider purchasing more shares to increase your borrowing capacity.';
                    break;
                default:
                    message = 'This is a reminder from SACCO management.';
            }
        }

        const messages = [];
        const notifications = [];

        for (const memberId of member_ids) {
            const msg = await Message.create({
                sender_id: adminId,
                recipient_id: memberId,
                subject,
                body: message
            });
            messages.push(msg);

            notifications.push({
                user_id: memberId,
                type: 'reminder',
                title: subject,
                message: message,
                related_entity_type: 'message',
                related_entity_id: msg.id
            });
        }

        if (notifications.length > 0) {
            await Notification.createBulk(notifications);
        }

        res.json({
            success: true,
            message: `Reminders sent to ${member_ids.length} members`,
            sent_count: messages.length
        });
    } catch (error) {
        console.error('Send reminders error:', error);
        res.status(500).json({ error: 'Failed to send reminders' });
    }
};

exports.listNotifications = async (req, res) => {
    try {
        const adminId = req.user.id;
        const notifications = await Notification.getByUser(adminId);
        const unreadCount = await Notification.getUnreadCount(adminId);

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