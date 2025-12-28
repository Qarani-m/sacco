const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const registrationCheck = require("../middleware/registrationCheck");
const loanController = require("../controllers/loanController");
const multer = require('multer');
const path = require('path');

// Configure upload storage
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/loan_docs/')
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
   }
});

const upload = multer({ storage: storage });

// All routes require authentication and registration fee paid
router.use(authMiddleware);
router.use(registrationCheck);

/* ============================
   📌 DISPLAY ROUTES
   ============================ */

// View all loans (pending, approved, rejected, paid)
router.get("/page", loanController.renderLoansPage);

// Loan request form
router.get("/request", loanController.showRequestForm);

// Single loan detail page
router.get("/:loanId", loanController.viewLoanDetails);

// Loan repayment schedule
router.get("/:loanId/schedule", loanController.viewRepaymentSchedule);

// View guarantors for this loan
router.get("/:loanId/guarantors", loanController.viewLoanGuarantors);

// Calculate maximum loan amount
router.get("/calculate/max", loanController.calculateMaxLoan);

/* ============================
   📌 ACTION ROUTES
   ============================ */

// Submit new loan request
router.post("/request", upload.array('loanDocuments', 5), loanController.requestLoan);

// Repay a loan
router.post("/:loanId/repay", loanController.repayLoan);

// Cancel a pending loan request
router.post("/:loanId/cancel", loanController.cancelLoan);

// Calculate guarantor shares needed
router.post("/calculate/guarantors", loanController.calculateGuarantorsNeeded);

module.exports = router;
