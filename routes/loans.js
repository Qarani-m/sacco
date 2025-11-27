const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const registrationCheck = require('../middleware/registrationCheck');
const loanController = require('../controllers/loanController');

// All routes require authentication and registration fee paid
router.use(authMiddleware);
// router.use(registrationCheck);




/* ============================
   📌 DISPLAY ROUTES
   ============================ */

// View all loans (pending, approved, rejected, paid)
router.get('/page', loanController.renderLoansPage);

// Loan request form
router.get('/request', loanController.showRequestForm);

// Single loan detail page
router.get('/:loanId', loanController.viewLoanDetails);

// Loan repayment schedule
router.get('/:loanId/schedule', loanController.viewRepaymentSchedule);

// View guarantors for this loan
router.get('/:loanId/guarantors', loanController.viewLoanGuarantors);

// Calculate maximum loan amount
router.get('/calculate/max', loanController.calculateMaxLoan);


/* ============================
   📌 ACTION ROUTES
   ============================ */

// Submit new loan request
router.post('/request', loanController.requestLoan);

// Repay a loan
router.post('/:loanId/repay', loanController.repayLoan);

// Cancel a pending loan request
router.post('/:loanId/cancel', loanController.cancelLoan);

// Calculate guarantor shares needed
router.post('/calculate/guarantors', loanController.calculateGuarantorsNeeded);

module.exports = router;
