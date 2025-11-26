// controllers/shareController.js
const Share = require('../models/Share');

const viewShares = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalShares = await Share.getTotalByUser(userId);
        const availableShares = await Share.getAvailableByUser(userId);
        const pledgedShares = await Share.getPledgedByUser(userId);
        const totalValue = await Share.getValueByUser(userId);

 res.render('member/shares', {
    user: req.user,
    unreadMessages: 0,
    unreadNotifications: 0,
title:"",
    total_shares: totalShares,
    available_shares: availableShares,
    pledged_shares: pledgedShares?.length || 0,
    total_value: totalValue,
    pledged_details: pledgedShares || [],
    history: await Share.getHistory(userId),
});


    } catch (err) {
        console.error('viewShares error:', err);
        res.status(500).json({ message: 'Failed to fetch shares' });
    }
};

const showBuyForm = async (req, res) => {
    try {
        // example: show share price info
        const sharePrice = 1000; // KSh 1,000 per share
        res.json({
            message: "Share purchase form",
            sharePrice,
        });
    } catch (err) {
        console.error('showBuyForm error:', err);
        res.status(500).json({ message: 'Failed to show buy form' });
    }
};

const buyShares = async (req, res) => {
    try {
        const userId = req.user.id;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const amountPaid = quantity * 1000; // KSh 1,000 per share

        // Check 50k limit
        const currentValue = await Share.getValueByUser(userId);
        if (currentValue + amountPaid > 50000) {
            return res.status(400).json({ 
                error: 'Maximum share limit is KSh 50,000',
                current_value: currentValue,
                requested: amountPaid,
                max_allowed: 50000,
                available_to_buy: Math.floor((50000 - currentValue) / 1000)
            });
        }

        const newShare = await Share.create({
            user_id: userId,
            quantity,
            amount_paid: amountPaid,
        });

        // TODO: integrate M-Pesa payment here

        res.status(201).json({
            message: `Successfully purchased ${quantity} share(s)`,
            share: newShare,
        });
    } catch (err) {
        console.error('buyShares error:', err);
        res.status(500).json({ message: 'Failed to purchase shares' });
    }
};

const getAvailableShares = async (req, res) => {
    try {
        const userId = req.user.id;
        const available = await Share.getAvailableByUser(userId);
        res.json({ availableShares: available });
    } catch (err) {
        console.error('getAvailableShares error:', err);
        res.status(500).json({ message: 'Failed to fetch available shares' });
    }
};

const getPledgedShares = async (req, res) => {
    try {
        const userId = req.user.id;
        const pledged = await Share.getPledgedByUser(userId);
        res.json({ pledgedShares: pledged });
    } catch (err) {
        console.error('getPledgedShares error:', err);
        res.status(500).json({ message: 'Failed to fetch pledged shares' });
    }
};

const getShareHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await Share.getHistory(userId);
        res.json({ shareHistory: history });
    } catch (err) {
        console.error('getShareHistory error:', err);
        res.status(500).json({ message: 'Failed to fetch share history' });
    }
};

module.exports = {
    viewShares,
    showBuyForm,
    buyShares,
    getAvailableShares,
    getPledgedShares,
    getShareHistory,
};
