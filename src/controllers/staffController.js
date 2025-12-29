const Loan = require("../models/Loan");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AdminAction = require("../models/AdminAction");
const db = require("../models/db");

// Disbursement Officer Dashboard
exports.disbursementDashboard = async (req, res) => {
    try {
        // Get approved loans waiting for disbursement
        const pendingDisbursement = await Loan.getAll({ status: 'approved' });

        // Get recent disbursements
        const recentDisbursements = await Loan.getAll({ status: 'active' }); // Limit 5 in view or query

        res.render("staff/disbursement-dashboard", {
            title: "Disbursement Dashboard",
            user: req.user,
            pendingDisbursement,
            recentDisbursements: recentDisbursements.slice(0, 5)
        });
    } catch (error) {
        console.error("Disbursement dashboard error:", error);
        res.status(500).render("errors/500", { error });
    }
};

// Customer Service Dashboard
exports.customerServiceDashboard = async (req, res) => {
    try {
        const { search } = req.query;
        let members = [];

        if (search) {
            // Implement search logic or get all
            // For now get all
            members = await User.getAllMembers();
            // Simple in-memory filter if backend search not robust yet
            members = members.filter(m =>
                m.full_name.toLowerCase().includes(search.toLowerCase()) ||
                m.email.toLowerCase().includes(search.toLowerCase())
            );
        } else {
            // Limit to recent or all?
            members = await User.getAllMembers();
        }

        res.render("staff/customer-service-dashboard", {
            title: "Customer Service Dashboard",
            user: req.user,
            members: members.slice(0, 20), // Limit for performance
            searchQuery: search
        });
    } catch (error) {
        console.error("CS dashboard error:", error);
        res.status(500).render("errors/500", { error });
    }
};

// Finance Dashboard
exports.financeDashboard = async (req, res) => {
    try {
        // Get financial overview
        // Total savings, Total loans, Total incomes
        const stats = await db.query(`
            SELECT 
                (SELECT COALESCE(SUM(amount), 0) FROM savings) as total_savings,
                (SELECT COALESCE(SUM(balance_remaining), 0) FROM loans WHERE status = 'active') as active_loans_value,
                (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'completed') as total_transactions_volume
        `);

        const recentTransactions = await Transaction.getAll({}); // Replaced getHistory with getAll

        res.render("staff/finance-dashboard", {
            title: "Finance Dashboard",
            user: req.user,
            stats: stats.rows[0],
            recentTransactions: recentTransactions.slice(0, 10)
        });
    } catch (error) {
        console.error("Finance dashboard error:", error);
        res.status(500).render("errors/500", { error });
    }
};

// Risk Dashboard
exports.riskDashboard = async (req, res) => {
    try {
        // Get loans pending approval
        const pendingLoans = await Loan.getAll({ status: 'pending' });

        // Get overview of risk
        // e.g. defaulted loans? active loans vs savings ratio

        res.render("staff/risk-dashboard", {
            title: "Risk Dashboard",
            user: req.user,
            pendingLoans
        });
    } catch (error) {
        console.error("Risk dashboard error:", error);
        res.status(500).render("errors/500", { error });
    }
};
