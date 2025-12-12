// services/reportService.js
const Report = require("../models/Report");

class ReportService {
  // Helper to format currency
  static formatCurrency(amount) {
    return parseFloat(amount || 0).toFixed(2);
  }

  // Helper to format date
  static formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  }

  // Helper: JSON to CSV
  static convertToCSV(data, headers) {
    if (!data || !data.length) {
      return headers.join(",") + "\n";
    }

    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ("" + (row[header] || "")).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }

  // ==========================================
  // LOANS
  // ==========================================
  static async getLoanReportData(filters) {
    const rawData = await Report.getSaccoLoans(filters);

    // Calculate statistics
    const stats = {
      total_loans: rawData.length,
      total_loaned: rawData.reduce(
        (sum, loan) => sum + parseFloat(loan.approved_amount || 0),
        0
      ),
      total_repaid: rawData.reduce(
        (sum, loan) =>
          sum +
          (parseFloat(loan.approved_amount || 0) -
            parseFloat(loan.balance_remaining || 0)),
        0
      ),
      total_balance: rawData.reduce(
        (sum, loan) => sum + parseFloat(loan.balance_remaining || 0),
        0
      ),
    };

    return { loans: rawData, statistics: stats };
  }

  static async getLoanReportCSV(filters) {
    const { loans } = await this.getLoanReportData(filters);

    // Map to CSV friendly format
    const csvData = loans.map((loan) => ({
      "Loan ID": loan.id,
      "Borrower ID": loan.borrower_id,
      "Requested Amount": this.formatCurrency(loan.requested_amount),
      "Approved Amount": this.formatCurrency(loan.approved_amount),
      "Balance Remaining": this.formatCurrency(loan.balance_remaining),
      "Interest Rate": loan.interest_rate + "%",
      "Repayment Months": loan.repayment_months,
      Status: loan.status,
      "Date Created": this.formatDate(loan.created_at),
      "Due Date": this.formatDate(loan.due_date),
    }));

    const headers = [
      "Loan ID",
      "Borrower ID",
      "Requested Amount",
      "Approved Amount",
      "Balance Remaining",
      "Interest Rate",
      "Repayment Months",
      "Status",
      "Date Created",
      "Due Date",
    ];
    return this.convertToCSV(csvData, headers);
  }

  // ==========================================
  // SHARES
  // ==========================================
  static async getShareReportData(filters) {
    const rawData = await Report.getSaccoShares(filters);

    // Group by member for better view
    const memberSummary = {};
    let totalShares = 0;
    let totalValue = 0;

    rawData.forEach((share) => {
      if (!memberSummary[share.user_id]) {
        memberSummary[share.user_id] = {
          user_id: share.user_id,
          full_name: share.full_name,
          email: share.email,
          total_shares: 0,
          total_value: 0,
        };
      }
      memberSummary[share.user_id].total_shares += share.quantity;
      memberSummary[share.user_id].total_value += parseFloat(share.amount_paid);

      totalShares += share.quantity;
      totalValue += parseFloat(share.amount_paid);
    });

    return {
      shares: rawData,
      member_summary: Object.values(memberSummary),
      statistics: { total_shares: totalShares, total_value: totalValue },
    };
  }

  static async getShareReportCSV(filters) {
    const { shares } = await this.getShareReportData(filters);

    const csvData = shares.map((share) => ({
      "Member Name": share.full_name,
      Email: share.email,
      Quantity: share.quantity,
      "Amount Paid": this.formatCurrency(share.amount_paid),
      "Purchase Date": this.formatDate(share.purchase_date),
      Status: share.status,
    }));

    const headers = [
      "Member Name",
      "Email",
      "Quantity",
      "Amount Paid",
      "Purchase Date",
      "Status",
    ];
    return this.convertToCSV(csvData, headers);
  }

  // ==========================================
  // WELFARE
  // ==========================================
  static async getWelfareReportData(filters) {
    const rawData = await Report.getSaccoWelfare(filters);

    // Enhance with display data
    const enhancedData = rawData.map((w) => ({
      ...w,
      member_name: w.full_name,
    }));

    return {
      payments: enhancedData,
      year: filters.year || new Date().getFullYear(),
    };
  }

  static async getWelfareReportCSV(filters) {
    const { payments } = await this.getWelfareReportData(filters);

    const csvData = payments.map((p) => ({
      "Member Name": p.full_name,
      Email: p.email,
      Amount: this.formatCurrency(p.amount),
      "Payment Date": this.formatDate(p.payment_date),
      Method: p.payment_method,
      Reference: p.transaction_ref,
    }));

    const headers = [
      "Member Name",
      "Email",
      "Amount",
      "Payment Date",
      "Method",
      "Reference",
    ];
    return this.convertToCSV(csvData, headers);
  }

  // ==========================================
  // SAVINGS (SACCO)
  // ==========================================
  static async getSaccoSavingsReportData(filters) {
    const rawData = await Report.getSaccoSavings(filters);

    // If single year filter, wrap in array for consistency
    const result = rawData ? [rawData] : [];
    if (filters.year && rawData) {
      result[0].year = filters.year;
    }

    return {
      savings: result,
    };
  }

  static async getSaccoSavingsReportCSV(filters) {
    const { savings } = await this.getSaccoSavingsReportData(filters);

    const csvData = savings.map((s) => ({
      Year: s.year || "All Time",
      "Total Savings": this.formatCurrency(s.total_savings),
      "Total Interest Collected": this.formatCurrency(s.total_interest),
    }));

    const headers = ["Year", "Total Savings", "Total Interest Collected"];
    return this.convertToCSV(csvData, headers);
  }

  // ==========================================
  // MEMBER STATS
  // ==========================================
  static async getMemberStatsData() {
    return await Report.getMemberStats();
  }

  static async getMemberStatsCSV() {
    const stats = await this.getMemberStatsData();

    const csvData = [
      { Metric: "Total Members", Count: stats.total_members },
      { Metric: "Active Members", Count: stats.active_members },
      { Metric: "Inactive Members", Count: stats.inactive_members },
    ];

    const headers = ["Metric", "Count"];
    return this.convertToCSV(csvData, headers);
  }
}

module.exports = ReportService;
