const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Loan = require("../models/Loan");
const LoanRepayment = require("../models/LoanRepayment");
const WelfarePayment = require("../models/WelfarePayment");
const Share = require("../models/Share");
const Savings = require("../models/Savings");
const SaccoSavings = require("../models/SaccoSavings");
const Notification = require("../models/Notification");

const paymentService = require("../services/paymentService");

exports.initiatePayment = async (req, res) => {
  try {
    const { category, userId } = req.params;
    const { amount, phone_number, registered_number } = req.body;
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the authenticated user is authorized
    if (req.user.id !== userId) {
      return res.status(403).json({
        error: `Unauthorized to initiate payment for this user ${userId}`,
      });
    }

    // Determine phone number to use
    const paymentPhoneNumber = registered_number
      ? user.phone_number
      : phone_number;

    if (!paymentPhoneNumber) {
      console.log("Phone number is erequired");
      return res.status(400).json({ error: "Phone number is required" });
    }

    const transactionRef = `SACCO${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // M-Pesa STK Push FIRST to get CheckoutRequestID
    const mpesaResponse = await paymentService.initiateSTKPush(
      paymentPhoneNumber,
      amount,
      transactionRef,
      `Payment for ${category}`
    );

    // NOW create transaction with CheckoutRequestID
    await Transaction.create({
      user_id: userId,
      amount,
      type: category,
      payment_method: "mpesa",
      transaction_ref: mpesaResponse.CheckoutRequestID, // ← Use THIS as ref
      mpesa_merchant_request_id: mpesaResponse.MerchantRequestID, // Store this too
      status: "pending",
    });

    console.log(`Transaction created with CheckoutRequestID: ${mpesaResponse.CheckoutRequestID}`);

    res.json({
      success: true,
      message: "Payment initiated. Check your phone for M-Pesa prompt",
      transaction_ref: transactionRef,
      checkout_request_id: mpesaResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ error: "Failedgg to initiate payment" });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    console.log("M-Pesa Callback Received:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.error("Invalid callback body structure");
      return res.sendStatus(200);
    }

    const callbackData = Body.stkCallback;
    const checkoutRequestId = callbackData.CheckoutRequestID; // This is what we stored
    const resultCode = callbackData.ResultCode;
    const resultDesc = callbackData.ResultDesc;

    console.log(
      `Processing callback for CheckoutRequestID: ${checkoutRequestId}, ResultCode: ${resultCode}`
    );

    // NOW this will find the transaction
    const transaction = await Transaction.findByRef(checkoutRequestId);

    if (!transaction) {
      console.error(`Transaction not found for CheckoutRequestID: ${checkoutRequestId}`);
      return res.sendStatus(200);
    }

    if (transaction.status === "completed") {
      console.log(`Transaction ${checkoutRequestId} already completed`);
      return res.sendStatus(200);
    }

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = callbackData.CallbackMetadata;
      let mpesaReceiptNumber = "";
      
      if (callbackMetadata && callbackMetadata.Item) {
        const receiptItem = callbackMetadata.Item.find(
          (item) => item.Name === "MpesaReceiptNumber"
        );
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
        }
      }

      // Update transaction status
      await Transaction.updateStatus(checkoutRequestId, "completed");

      // Allocate payment: loan → welfare → shares → savings
      await allocatePayment(transaction);

      // Notify user
      await Notification.create({
        user_id: transaction.user_id,
        type: "payment_success",
        title: "Payment Successful",
        message: `Your payment of KSh ${transaction.amount} has been processed successfully. Ref: ${mpesaReceiptNumber}`,
        related_entity_type: "transaction",
        related_entity_id: transaction.id,
      });

      console.log(
        `Payment allocated successfully for transaction ${transaction.id}`
      );
    } else {
      // Payment failed or cancelled
      console.log(`Payment failed: ${resultDesc}`);
      await Transaction.updateStatus(checkoutRequestId, "failed");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    res.sendStatus(200);
  }
};


async function allocatePayment(transaction) {
  const userId = transaction.user_id;
  let remainingAmount = parseFloat(transaction.amount);
  const currentYear = new Date().getFullYear();

  // 1. Allocate to loans first
  if (transaction.type === "loan_repayment" || remainingAmount > 0) {
    const activeLoans = await Loan.getByUser(userId, "active");

    for (const loan of activeLoans) {
      if (remainingAmount <= 0) break;

      const paymentAmount = Math.min(remainingAmount, loan.balance_remaining);

      // Calculate interest and principal split
      const interestRate = loan.interest_rate / 100;
      const monthlyInterest = loan.approved_amount * interestRate;
      const interestAmount = Math.min(paymentAmount * 0.5, monthlyInterest);
      const principalAmount = paymentAmount - interestAmount;

      // Record loan repayment
      await LoanRepayment.create({
        loan_id: loan.id,
        user_id: userId,
        amount_paid: paymentAmount,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        transaction_ref: transaction.transaction_ref,
      });

      // Update loan balance
      const newBalance = loan.balance_remaining - paymentAmount;
      await Loan.updateBalance(loan.id, newBalance);

      // Add interest to SACCO savings
      await SaccoSavings.addInterest(currentYear, interestAmount);

      // If loan fully paid, release guarantor shares
      if (newBalance <= 0) {
        const LoanGuarantor = require("../models/LoanGuarantor");
        await LoanGuarantor.releaseByLoan(loan.id);
      }

      remainingAmount -= paymentAmount;
    }
  }

  // 2. Allocate to welfare if specified or has remaining
  if (transaction.type === "welfare" || remainingAmount >= 300) {
    const welfareAmount =
      transaction.type === "welfare"
        ? transaction.amount
        : Math.min(remainingAmount, 300);

    await WelfarePayment.create({
      user_id: userId,
      amount: welfareAmount,
      payment_method: "mpesa",
      transaction_ref: transaction.transaction_ref,
    });

    remainingAmount -= welfareAmount;
  }

  // 3. Allocate to shares if specified
  if (transaction.type === "shares") {
    const shareQuantity = Math.floor(transaction.amount / 1000);

    await Share.create({
      user_id: userId,
      quantity: shareQuantity,
      amount_paid: transaction.amount,
    });

    remainingAmount = 0;
  }

  // 4. Registration fee
  if (transaction.type === "registration") {
    await User.markRegistrationPaid(userId);

    const query = `
            INSERT INTO registration_fees (user_id, amount, payment_date, transaction_ref)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
            ON CONFLICT (transaction_ref) DO NOTHING
        `;
    const db = require("../models/db");
    await db.query(query, [
      userId,
      transaction.amount,
      transaction.transaction_ref,
    ]);

    remainingAmount = 0;
  }

  // 5. Surplus goes to member's savings
  if (remainingAmount > 0) {
    await Savings.create({
      user_id: userId,
      year: currentYear,
      amount: remainingAmount,
      type: "surplus",
    });
  }
}

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionRef } = req.params;
    const transaction = await Transaction.findByRef(transactionRef);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      success: true,
      status: transaction.status,
      transaction,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.getByUser(userId);

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // Admin manual verification - requires 2/3 approval
    const { transaction_ref, reason } = req.body;
    const adminId = req.user.id;

    const AdminAction = require("../models/AdminAction");

    const action = await AdminAction.create({
      initiated_by: adminId,
      action_type: "update",
      entity_type: "payment_transaction",
      entity_id: null,
      reason,
      action_data: { transaction_ref, status: "completed" },
    });

    res.json({
      success: true,
      message: "Payment verification initiated. Requires 2/3 admin approval",
      action_id: action.id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
