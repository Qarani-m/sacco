// Loan Request Page JavaScript

const totalShares = window.totalShares || 0;
const maxLoanWithoutGuarantors = window.maxLoan || 0;
let selectedGuarantors = [];

// Update loan summary when amount changes
document
  .getElementById("loanAmount")
  .addEventListener("input", updateLoanSummary);

function updateLoanSummary() {
  const amount = parseFloat(document.getElementById("loanAmount").value) || 0;
  const months =
    parseInt(document.getElementById("repaymentMonths").value) || 1;
  const interest = amount * 0.01 * months;
  const total = amount + interest;

  document.getElementById(
    "summaryAmount"
  ).textContent = `KSh ${amount.toLocaleString()}`;
  document.getElementById(
    "summaryInterest"
  ).textContent = `KSh ${interest.toLocaleString()}`;
  document.getElementById(
    "summaryTotal"
  ).textContent = `KSh ${total.toLocaleString()}`;

  // Check if guarantors needed
  if (amount > maxLoanWithoutGuarantors) {
    const shortfall = amount - maxLoanWithoutGuarantors;
    const sharesNeeded = Math.ceil(shortfall / 1000);

    document.getElementById("guarantorSection").style.display = "block";
    document.getElementById("shortfallAmount").textContent =
      shortfall.toLocaleString();
    document.getElementById("sharesNeeded").textContent = sharesNeeded;
    document.getElementById(
      "amountHelp"
    ).textContent = `You need ${sharesNeeded} shares from guarantors`;
    document.getElementById("amountHelp").style.color = "#EF4444";
  } else {
    document.getElementById("guarantorSection").style.display = "none";
    document.getElementById(
      "amountHelp"
    ).textContent = `Your shares cover up to KSh ${maxLoanWithoutGuarantors.toLocaleString()}`;
    document.getElementById("amountHelp").style.color = "#6B7280";
  }
}

// Search for guarantors
document
  .getElementById("searchGuarantorsBtn")
  .addEventListener("click", async function () {
    try {
      const response = await fetch("/guarantors/search");
      const data = await response.json();

      if (data.success && data.eligible_guarantors) {
        showGuarantorModal(data.eligible_guarantors);
      } else {
        alert("No eligible guarantors found");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to search for guarantors");
    }
  });

function showGuarantorModal(guarantors) {
  const modal = document.getElementById("guarantorModal");
  const list = document.getElementById("guarantorList");

  if (guarantors.length === 0) {
    list.innerHTML =
      '<p class="text-secondary" style="padding: 2rem; text-align: center;">No eligible guarantors available</p>';
  } else {
    list.innerHTML = guarantors
      .map(
        (g) => `
            <div class="card-hover" style="padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: 600; margin-bottom: 0.25rem;">${
                      g.full_name
                    }</p>
                    <p class="text-secondary" style="font-size: 0.875rem;">
                        Available shares: ${g.available_shares} (KSh ${(
          g.available_shares * 1000
        ).toLocaleString()})
                    </p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="number" 
                           id="shares_${g.id}" 
                           min="1" 
                           max="${g.available_shares}" 
                           placeholder="Shares" 
                           style="width: 100px; padding: 0.5rem; border: 1px solid #E5E5E5; border-radius: 4px;">
                    <button onclick="selectGuarantor('${g.id}', '${
          g.full_name
        }', ${g.available_shares})" 
                            class="btn-small">
                        Select
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  modal.classList.add("active");
}

function selectGuarantor(id, name, maxShares) {
  const sharesInput = document.getElementById(`shares_${id}`);
  const shares = parseInt(sharesInput.value);

  if (!shares || shares < 1) {
    alert("Please enter number of shares");
    return;
  }

  if (shares > maxShares) {
    alert(`Maximum ${maxShares} shares available`);
    return;
  }

  // Check if already selected
  const existing = selectedGuarantors.find((g) => g.id === id);
  if (existing) {
    existing.shares = shares;
  } else {
    selectedGuarantors.push({ id, name, shares });
  }

  updateSelectedGuarantors();
  document.getElementById("guarantorModal").classList.remove("active");
}

function updateSelectedGuarantors() {
  const container = document.getElementById("selectedGuarantors");

  if (selectedGuarantors.length === 0) {
    container.innerHTML =
      '<p class="text-secondary">No guarantors selected</p>';
    return;
  }

  const totalGuarantorShares = selectedGuarantors.reduce(
    (sum, g) => sum + g.shares,
    0
  );

  container.innerHTML = `
        <h4 class="small-title" style="margin-bottom: 1rem;">Selected Guarantors (${
          selectedGuarantors.length
        })</h4>
        <div style="margin-bottom: 1rem;">
            ${selectedGuarantors
              .map(
                (g) => `
                <div class="card" style="padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="font-weight: 600;">${g.name}</p>
                        <p class="text-secondary" style="font-size: 0.875rem;">
                            ${g.shares} shares (KSh ${(
                  g.shares * 1000
                ).toLocaleString()})
                        </p>
                    </div>
                    <button onclick="removeGuarantor('${
                      g.id
                    }')" class="btn-small" style="background: #EF4444;">
                        Remove
                    </button>
                </div>
            `
              )
              .join("")}
        </div>
        <div style="padding: 1rem; background: #F0FDF4; border: 1px solid #D1FAE5; border-radius: 4px;">
            <p class="text-meta">Total Guarantor Coverage</p>
            <p style="font-weight: 600; font-size: 1.125rem;">
                ${totalGuarantorShares} shares (KSh ${(
    totalGuarantorShares * 1000
  ).toLocaleString()})
            </p>
        </div>
    `;
}

function removeGuarantor(id) {
  selectedGuarantors = selectedGuarantors.filter((g) => g.id !== id);
  updateSelectedGuarantors();
}

// Close modal
document
  .getElementById("closeGuarantorModal")
  .addEventListener("click", function () {
    document.getElementById("guarantorModal").classList.remove("active");
  });

document
  .getElementById("guarantorModal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.remove("active");
    }
  });

// Submit loan request
document
  .getElementById("loanRequestForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("loanAmount").value);
    const months = parseInt(document.getElementById("repaymentMonths").value);

    if (!amount || !months) {
      alert("Please fill in all fields");
      return;
    }

    // Validate guarantors if needed
    if (amount > maxLoanWithoutGuarantors) {
      const totalGuarantorShares = selectedGuarantors.reduce(
        (sum, g) => sum + g.shares,
        0
      );
      const totalCoverage =
        maxLoanWithoutGuarantors + totalGuarantorShares * 1000;

      if (totalCoverage < amount) {
        alert(
          `Insufficient coverage. You need KSh ${(
            amount - totalCoverage
          ).toLocaleString()} more in guarantor shares.`
        );
        return;
      }
    }

    const requestData = {
      requested_amount: amount,
      repayment_months: months,
      guarantors: selectedGuarantors.map((g) => ({
        guarantor_id: g.id,
        shares_requested: g.shares,
      })),
    };

    const button = this.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = "Submitting...";

    try {
      const response = await fetch("/loans/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.csrfToken,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Loan request submitted successfully! Awaiting admin approval.");
        window.location.href = "/loans/page";
      } else {
        alert("Error: " + (data.error || "Failed to submit loan request"));
        button.disabled = false;
        button.textContent = "Submit Loan Request";
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit loan request. Please try again.");
      button.disabled = false;
      button.textContent = "Submit Loan Request";
    }
  });
