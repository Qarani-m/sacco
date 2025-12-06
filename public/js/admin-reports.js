// Admin Reports JavaScript

// Loan Report Form
document
  .getElementById("loanReportForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      status: formData.get("status"),
    };

    try {
      const response = await fetch("/admin/reports/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.csrfToken,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        displayLoanReport(result.report);
      } else {
        alert("Error generating report: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate report");
    }
  });

// Share Report
async function generateShareReport() {
  try {
    const response = await fetch("/admin/reports/shares", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window.csrfToken,
      },
    });

    const result = await response.json();

    if (result.success) {
      displayShareReport(result.report);
    } else {
      alert("Error generating report: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate report");
  }
}

// Welfare Report Form
document
  .getElementById("welfareReportForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const year = formData.get("year");

    try {
      const response = await fetch("/admin/reports/welfare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.csrfToken,
        },
        body: JSON.stringify({ year }),
      });

      const result = await response.json();

      if (result.success) {
        displayWelfareReport(result.report);
      } else {
        alert("Error generating report: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate report");
    }
  });

// Savings Report Form
document
  .getElementById("savingsReportForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const year = formData.get("year");

    try {
      const response = await fetch("/admin/reports/savings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.csrfToken,
        },
        body: JSON.stringify({ year }),
      });

      const result = await response.json();

      if (result.success) {
        displaySavingsReport(result.report);
      } else {
        alert("Error generating report: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate report");
    }
  });

// SACCO Savings Report
async function generateSaccoSavingsReport() {
  try {
    const response = await fetch("/admin/reports/sacco-savings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window.csrfToken,
      },
    });

    const result = await response.json();

    if (result.success) {
      displaySaccoSavingsReport(result.report);
    } else {
      alert("Error generating report: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate report");
  }
}

// Member Statistics
async function generateMemberStats() {
  try {
    const response = await fetch("/admin/reports/member-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window.csrfToken,
      },
    });

    const result = await response.json();

    if (result.success) {
      displayMemberStatsReport(result.report);
    } else {
      alert("Error generating report: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate report");
  }
}

// Store current report data for export
let currentReportData = null;
let currentReportType = null;

// Display Functions

function displayLoanReport(report) {
  currentReportData = report;
  currentReportType = "loan";

  const content = `
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Loan Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Loans</div>
                    <div style="font-size: 2rem; font-weight: 700;">${
                      report.statistics.total_loans
                    }</div>
                </div>
                <div style="background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Loaned</div>
                    <div style="font-size: 2rem; font-weight: 700;">KSh ${parseFloat(
                      report.statistics.total_loaned
                    ).toLocaleString()}</div>
                </div>
                <div style="background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Repaid</div>
                    <div style="font-size: 2rem; font-weight: 700;">KSh ${parseFloat(
                      report.statistics.total_repaid
                    ).toLocaleString()}</div>
                </div>
                <div style="background: linear-gradient(135deg, #43E97B 0%, #38F9D7 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Balance Remaining</div>
                    <div style="font-size: 2rem; font-weight: 700;">KSh ${parseFloat(
                      report.statistics.total_balance
                    ).toLocaleString()}</div>
                </div>
            </div>
        </div>

        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Loan Details</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F3F4F6; text-align: left;">
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Borrower</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Amount</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Balance</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Status</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.loans
                      .map(
                        (loan) => `
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 0.75rem;">${
                              loan.borrower_name
                            }</td>
                            <td style="padding: 0.75rem;">KSh ${parseFloat(
                              loan.approved_amount || loan.requested_amount
                            ).toLocaleString()}</td>
                            <td style="padding: 0.75rem;">KSh ${parseFloat(
                              loan.balance_remaining || 0
                            ).toLocaleString()}</td>
                            <td style="padding: 0.75rem;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: ${
                                  loan.status === "paid"
                                    ? "#D1FAE5"
                                    : loan.status === "active"
                                    ? "#DBEAFE"
                                    : "#FEF3C7"
                                }; color: ${
                          loan.status === "paid"
                            ? "#059669"
                            : loan.status === "active"
                            ? "#2563EB"
                            : "#D97706"
                        };">
                                    ${loan.status}
                                </span>
                            </td>
                            <td style="padding: 0.75rem;">${new Date(
                              loan.created_at
                            ).toLocaleDateString()}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `;

  showReport(content);
}

function displayShareReport(report) {
  currentReportData = report;
  currentReportType = "share";

  const content = `
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Share Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Shares</div>
                    <div style="font-size: 2rem; font-weight: 700;">${report.statistics.total_shares.toLocaleString()}</div>
                </div>
                <div style="background: linear-gradient(135deg, #43E97B 0%, #38F9D7 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Value</div>
                    <div style="font-size: 2rem; font-weight: 700;">KSh ${parseFloat(
                      report.statistics.total_value
                    ).toLocaleString()}</div>
                </div>
            </div>
        </div>

        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Member Share Holdings</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F3F4F6; text-align: left;">
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Member</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Email</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Total Shares</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.member_summary
                      .map(
                        (member) => `
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 0.75rem; font-weight: 500;">${
                              member.full_name
                            }</td>
                            <td style="padding: 0.75rem; color: #6B7280;">${
                              member.email
                            }</td>
                            <td style="padding: 0.75rem;">${parseInt(
                              member.total_shares
                            ).toLocaleString()}</td>
                            <td style="padding: 0.75rem; font-weight: 600;">KSh ${parseFloat(
                              member.total_value
                            ).toLocaleString()}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `;

  showReport(content);
}

function displayWelfareReport(report) {
  currentReportData = report;
  currentReportType = "welfare";

  const content = `
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Welfare Contributions - ${
          report.year
        }</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F3F4F6; text-align: left;">
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Member</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Amount</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Date</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Method</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      report.payments && report.payments.length > 0
                        ? report.payments
                            .map(
                              (payment) => `
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 0.75rem;">${
                              payment.member_name
                            }</td>
                            <td style="padding: 0.75rem;">KSh ${parseFloat(
                              payment.amount
                            ).toLocaleString()}</td>
                            <td style="padding: 0.75rem;">${new Date(
                              payment.payment_date
                            ).toLocaleDateString()}</td>
                            <td style="padding: 0.75rem;">${
                              payment.payment_method
                            }</td>
                        </tr>
                    `
                            )
                            .join("")
                        : '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: #6B7280;">No welfare payments found for this year</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    `;

  showReport(content);
}

function displaySavingsReport(report) {
  currentReportData = report;
  currentReportType = "savings";

  const content = `
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Member Savings - ${
          report.year
        }</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F3F4F6; text-align: left;">
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Member</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Amount</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      report.savings && report.savings.length > 0
                        ? report.savings
                            .map(
                              (saving) => `
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 0.75rem;">${
                              saving.member_name
                            }</td>
                            <td style="padding: 0.75rem;">KSh ${parseFloat(
                              saving.amount
                            ).toLocaleString()}</td>
                            <td style="padding: 0.75rem;">${saving.type}</td>
                        </tr>
                    `
                            )
                            .join("")
                        : '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: #6B7280;">No savings found for this year</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    `;

  showReport(content);
}

function displaySaccoSavingsReport(report) {
  currentReportData = report;
  currentReportType = "sacco";

  const content = `
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">SACCO Collective Savings (Interest)</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #F3F4F6; text-align: left;">
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Year</th>
                        <th style="padding: 0.75rem; font-size: 0.875rem; font-weight: 600;">Total Interest Collected</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      report.savings && report.savings.length > 0
                        ? report.savings
                            .map(
                              (saving) => `
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 0.75rem; font-weight: 600;">${
                              saving.year
                            }</td>
                            <td style="padding: 0.75rem; font-weight: 600; color: #10B981;">KSh ${parseFloat(
                              saving.total_interest_collected
                            ).toLocaleString()}</td>
                        </tr>
                    `
                            )
                            .join("")
                        : '<tr><td colspan="2" style="padding: 2rem; text-align: center; color: #6B7280;">No SACCO savings found</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    `;

  showReport(content);
}

function displayMemberStatsReport(report) {
  currentReportData = report;
  currentReportType = "member";

  const content = `
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Member Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <div style="background: linear-gradient(135deg, #30CFD0 0%, #330867 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Members</div>
                    <div style="font-size: 2rem; font-weight: 700;">${
                      report.total_members || 0
                    }</div>
                </div>
                <div style="background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Active Members</div>
                    <div style="font-size: 2rem; font-weight: 700;">${
                      report.active_members || 0
                    }</div>
                </div>
                <div style="background: linear-gradient(135deg, #43E97B 0%, #38F9D7 100%); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Registered & Paid</div>
                    <div style="font-size: 2rem; font-weight: 700;">${
                      report.registered_members || 0
                    }</div>
                </div>
            </div>
        </div>
    `;

  showReport(content);
}

function showReport(content) {
  document.getElementById("reportContent").innerHTML = content;
  document.getElementById("reportResults").style.display = "block";
  document
    .getElementById("reportResults")
    .scrollIntoView({ behavior: "smooth" });
}

function closeReport() {
  document.getElementById("reportResults").style.display = "none";
  currentReportData = null;
  currentReportType = null;
}

function printReport() {
  window.print();
}

function exportReport() {
  if (!currentReportData || !currentReportType) {
    alert("No report data to export");
    return;
  }

  let csvContent = "";
  let filename = "";

  switch (currentReportType) {
    case "loan":
      filename = "loan_report.csv";
      csvContent = "Borrower,Amount,Balance,Status,Date\n";
      currentReportData.loans.forEach((loan) => {
        csvContent += `"${loan.borrower_name}",${
          loan.approved_amount || loan.requested_amount
        },${loan.balance_remaining || 0},${loan.status},${new Date(
          loan.created_at
        ).toLocaleDateString()}\n`;
      });
      break;
    case "share":
      filename = "share_report.csv";
      csvContent = "Member,Email,Total Shares,Total Value\n";
      currentReportData.member_summary.forEach((member) => {
        csvContent += `"${member.full_name}","${member.email}",${member.total_shares},${member.total_value}\n`;
      });
      break;
    case "welfare":
      filename = `welfare_report_${currentReportData.year}.csv`;
      csvContent = "Member,Amount,Date,Method\n";
      if (currentReportData.payments) {
        currentReportData.payments.forEach((payment) => {
          csvContent += `"${payment.member_name}",${payment.amount},${new Date(
            payment.payment_date
          ).toLocaleDateString()},${payment.payment_method}\n`;
        });
      }
      break;
    case "savings":
      filename = `savings_report_${currentReportData.year}.csv`;
      csvContent = "Member,Amount,Type\n";
      if (currentReportData.savings) {
        currentReportData.savings.forEach((saving) => {
          csvContent += `"${saving.member_name}",${saving.amount},${saving.type}\n`;
        });
      }
      break;
    case "sacco":
      filename = "sacco_savings_report.csv";
      csvContent = "Year,Total Interest Collected\n";
      if (currentReportData.savings) {
        currentReportData.savings.forEach((saving) => {
          csvContent += `${saving.year},${saving.total_interest_collected}\n`;
        });
      }
      break;
    case "member":
      filename = "member_statistics.csv";
      csvContent = "Metric,Count\n";
      csvContent += `Total Members,${currentReportData.total_members || 0}\n`;
      csvContent += `Active Members,${currentReportData.active_members || 0}\n`;
      csvContent += `Registered & Paid,${
        currentReportData.registered_members || 0
      }\n`;
      break;
  }

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
