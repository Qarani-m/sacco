// controllers/reportController.js
const Report = require('../models/Report');

const showReportsDashboard = async (req, res) => {
    try {
        // simple example: differentiate member vs admin
        const isAdmin = req.user.role === 'admin';
        res.json({ message: 'Reports Dashboard', isAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to show reports dashboard' });
    }
};

// ======= Member Reports =======
const generatePersonalSavingsReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const report = await Report.getPersonalSavings(userId);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate savings report' });
    }
};

const generatePersonalSharesReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const report = await Report.getPersonalShares(userId);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate shares report' });
    }
};

const generatePersonalLoansReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const report = await Report.getPersonalLoans(userId);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate loans report' });
    }
};

const generatePersonalWelfareReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const report = await Report.getPersonalWelfare(userId);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate welfare report' });
    }
};

// ======= SACCO (Admin) Reports =======
const generateSaccoLoanReport = async (req, res) => {
    try {
        const filters = req.body;
        const report = await Report.getSaccoLoans(filters);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate SACCO loan report' });
    }
};

const generateSaccoSharesReport = async (req, res) => {
    try {
        const filters = req.body;
        const report = await Report.getSaccoShares(filters);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate SACCO shares report' });
    }
};

const generateSaccoWelfareReport = async (req, res) => {
    try {
        const filters = req.body;
        const report = await Report.getSaccoWelfare(filters);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate SACCO welfare report' });
    }
};

const generateSaccoSavingsReport = async (req, res) => {
    try {
        const filters = req.body;
        const report = await Report.getSaccoSavings(filters);
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate SACCO savings report' });
    }
};

const generateMemberStatsReport = async (req, res) => {
    try {
        const report = await Report.getMemberStats();
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate member stats report' });
    }
};

const generateDefaultersReport = async (req, res) => {
    try {
        const report = await Report.getDefaulters();
        res.json({ report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate defaulters report' });
    }
};

// Export as PDF/Excel placeholder
const exportReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        // Placeholder logic: in reality you'd generate PDF/Excel
        res.json({ message: `Report ${reportId} export (PDF/Excel)` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to export report' });
    }
};

module.exports = {
    showReportsDashboard,
    generatePersonalSavingsReport,
    generatePersonalSharesReport,
    generatePersonalLoansReport,
    generatePersonalWelfareReport,
    generateSaccoLoanReport,
    generateSaccoSharesReport,
    generateSaccoWelfareReport,
    generateSaccoSavingsReport,
    generateMemberStatsReport,
    generateDefaultersReport,
    exportReport,
};
