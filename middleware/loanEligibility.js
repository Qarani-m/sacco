// middleware/registrationCheck.js
// Ensures a member has paid the Ksh.1000 registration fee before enabling loans/shares sections

// Replace with real DB calls
const { getMemberAccount } = require('../models/memberModel'); // implement this

const registrationCheck = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const userId = req.user.id;

    // fetch member financials
    const account = await getMemberAccount(userId);
    // expected shape: { id, registrationPaid: true/false, registrationPaidAt: Date|null, ... }
    if (!account) return res.status(404).json({ message: 'Member account not found' });

    if (!account.registrationPaid) {
      return res.status(403).json({
        message: 'Registration fee not paid. Please pay Ksh.1000 to activate loans and shares.',
        payAmount: 1000
      });
    }

    // else allow
    next();
  } catch (err) {
    console.error('registrationCheck error:', err);
    res.status(500).json({ message: 'Registration check failed' });
  }
};

module.exports = registrationCheck;
