const express = require('express');
const authMiddleware = require('../middleware/auth');
const registrationCheck = require('../middleware/registrationCheck');
const shareController = require('../controllers/shareController');

const router = express.Router();

// Global middleware
router.use(authMiddleware);
// router.use(registrationCheck);


/* ============================
   📌 DISPLAY ROUTES
   ============================ */

// View main share dashboard
router.get('/', shareController.viewShares);

// Show form to buy shares
router.get('/buy', shareController.showBuyForm);

// View available shares
router.get('/available', shareController.getAvailableShares);

// View pledged shares
router.get('/pledged', shareController.getPledgedShares);

// Full share history
router.get('/history', shareController.getShareHistory);


/* ============================
   📌 ACTION ROUTES
   ============================ */

// Process buying of shares
router.post('/buy', shareController.buyShares);

module.exports = router;
