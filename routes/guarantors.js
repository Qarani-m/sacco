const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const registrationCheck = require('../middleware/registrationCheck');
const guarantorController = require('../controllers/guarantorController');

// All routes require authentication and registration fee paid
router.use(authMiddleware);
// router.use(registrationCheck);


/* ============================
   DISPLAY ROUTES (Render Pages)
   ============================ */

// View guarantor requests sent to this member
router.get('/requests', guarantorController.viewRequestsPage);

// View detailed request

// --
// View detailed request
router.get('/requests/:requestId', guarantorController.viewRequestDetail);

// View loans this member is currently guaranteeing
router.get('/my-guarantees', guarantorController.viewMyGuarantees);

// Search for potential guarantors
router.get('/search', guarantorController.searchGuarantors);


/* ============================
   ACTION ROUTES (API / Logic)
   ============================ */

// Respond to a guarantor request (accept / decline)
router.post('/requests/:requestId/respond', guarantorController.respondToRequest);

// Send guarantor request to another member
router.post('/send-request', guarantorController.sendRequest);

// Send multiple guarantor requests for a loan
router.post('/send-bulk-requests', guarantorController.sendBulkRequests);

// Check if specific user is eligible to be a guarantor
router.get('/eligibility/:userId', guarantorController.checkEligibility);

module.exports = router;
