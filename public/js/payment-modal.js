/**
 * Reusable Payment Modal Module
 * Handles payment initiation with phone number selection for all payment types
 */

class PaymentModal {
  constructor() {
    this.modal = null;
    this.payButton = null;
    this.statusDiv = null;
    this.currentPaymentData = null;
    this.pollInterval = null;
    this.csrfToken = null;
    this.userPhone = null;

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    this.modal = document.getElementById("paymentModal");
    this.payButton = document.getElementById("paymentPayButton");
    this.statusDiv = document.getElementById("paymentModalStatus");

    if (!this.modal) {
      console.error("Payment modal not found in DOM");
      return;
    }

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close button
    const closeBtn = document.getElementById("paymentModalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Cancel button
    const cancelBtn = document.getElementById("paymentCancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.close());
    }

    // Pay button
    if (this.payButton) {
      this.payButton.addEventListener("click", () => this.initiatePayment());
    }

    // Phone option selections
    const phoneOptions = document.querySelectorAll(".phone-option");
    phoneOptions.forEach((option) => {
      option.addEventListener("click", function () {
        const optionValue = this.getAttribute("data-option");
        paymentModal.selectPhoneOption(optionValue);
      });
    });

    // Close modal when clicking outside
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.modal &&
        this.modal.classList.contains("active")
      ) {
        this.close();
      }
    });
  }

  /**
   * Open the payment modal
   * @param {Object} options - Payment options
   * @param {string} options.title - Modal title
   * @param {number} options.amount - Payment amount
   * @param {string} options.category - Payment category (registration, shares, welfare, etc.)
   * @param {string} options.userId - User ID
   * @param {string} options.userPhone - User's registered phone number
   * @param {string} options.csrfToken - CSRF token
   * @param {Object} options.metadata - Additional metadata to send with payment
   */
  open(options) {
    if (!this.modal) {
      console.error("Modal not initialized");
      return;
    }

    this.currentPaymentData = options;
    this.csrfToken = options.csrfToken;
    this.userPhone = options.userPhone;

    // Set modal title
    const titleEl = document.getElementById("paymentModalTitle");
    if (titleEl) {
      titleEl.textContent = options.title || "Complete Payment";
    }

    // Set amount display
    const amountEl = document.getElementById("paymentAmount");
    if (amountEl) {
      amountEl.textContent = `KSh ${options.amount.toLocaleString()}`;
    }

    // Set registered phone number
    const registeredNumberEl = document.getElementById(
      "paymentRegisteredNumber"
    );
    if (registeredNumberEl) {
      registeredNumberEl.textContent = options.userPhone;
    }

    // Reset form
    this.selectPhoneOption("registered");
    const customPhoneInput = document.getElementById("payment_custom_phone");
    if (customPhoneInput) {
      customPhoneInput.value = "";
    }
    if (this.statusDiv) {
      this.statusDiv.innerHTML = "";
    }

    // Show modal
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    if (!this.modal) return;

    this.modal.classList.remove("active");
    document.body.style.overflow = "auto";

    // Clear any polling interval/timeout
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    // Reset button state
    if (this.payButton) {
      this.payButton.disabled = false;
      this.payButton.textContent = "Send STK Push";
    }

    // Clear status
    if (this.statusDiv) {
      this.statusDiv.innerHTML = "";
    }
  }

  selectPhoneOption(option) {
    const registeredOption = document.getElementById("paymentRegisteredOption");
    const differentOption = document.getElementById("paymentDifferentOption");
    const customPhoneInput = document.getElementById("paymentCustomPhoneInput");

    if (option === "registered") {
      registeredOption?.classList.add("selected");
      differentOption?.classList.remove("selected");
      customPhoneInput?.classList.remove("active");
      const radioBtn = document.querySelector(
        'input[value="registered"][name="payment_phone_option"]'
      );
      if (radioBtn) radioBtn.checked = true;
    } else {
      registeredOption?.classList.remove("selected");
      differentOption?.classList.add("selected");
      customPhoneInput?.classList.add("active");
      const radioBtn = document.querySelector(
        'input[value="different"][name="payment_phone_option"]'
      );
      if (radioBtn) radioBtn.checked = true;
      // Focus on the custom phone input
      setTimeout(() => {
        const input = document.getElementById("payment_custom_phone");
        if (input) input.focus();
      }, 100);
    }
  }

  async initiatePayment() {
    if (!this.currentPaymentData) {
      console.error("No payment data available");
      return;
    }

    const selectedOption = document.querySelector(
      'input[name="payment_phone_option"]:checked'
    )?.value;
    let phoneNumber;

    if (selectedOption === "registered") {
      phoneNumber = this.userPhone;
    } else {
      phoneNumber = document.getElementById("payment_custom_phone")?.value;





      // Validate custom phone number
      if (!phoneNumber) {
        this.showStatus("Please enter a phone number", "error");
        return;
      }

      if (!/^254[0-9]{9}$/.test(phoneNumber)) {
        this.showStatus(
          "Invalid phone number format. Use 254XXXXXXXXX",
          "error"
        );
        return;
      }
    }

    // Disable button and show loading
    this.payButton.disabled = true;
    this.payButton.textContent = "Processing...";
    this.showStatus("Initiating M-PESA payment...");

    try {
      const endpoint = `/payments/initiate/${this.currentPaymentData.category}/${this.currentPaymentData.userId}`;
      const payload = {
        phone_number: phoneNumber,
        amount: this.currentPaymentData.amount,
        registered_number: selectedOption === "registered",
        ...this.currentPaymentData.metadata,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": this.csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.showStatus(
          `
                    <p style="margin: 0; font-weight: 600;">✓ STK Push Sent!</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                        Please check your phone ---->(${phoneNumber}) and enter your M-PESA PIN to complete the payment.
                    </p>
                    <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <div class="spinner" style="width: 16px; height: 16px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <span style="font-size: 0.875rem;">Waiting for confirmation...</span>
                    </div>
                    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
                `,
          "success"
        );

        // Start polling for payment status
        this.startPolling(data.transaction_ref || data.checkout_request_id);
      } else {
        this.showStatus(
          `Error: ${data.message || data.error || "Payment initiation failed"}`,
          "error"
        );
        this.payButton.disabled = false;
        this.payButton.textContent = "Send STK Push";
      }
    } catch (error) {
      console.error("Payment error:", error);
      this.showStatus("An error occurred. Please try again.", "error");
      this.payButton.disabled = false;
      this.payButton.textContent = "Send STK Push";
    }
  }

  startPolling(transactionRef) {
    let attempts = 0;
    const maxAttempts = 60; // 3 minutes total

    const poll = async () => {
      attempts++;

      // Dynamic interval: check more frequently at first, then slow down
      let nextInterval;
      if (attempts <= 6) {
        nextInterval = 2000; // First 12 seconds: check every 2s
      } else if (attempts <= 20) {
        nextInterval = 3000; // Next 42 seconds: check every 3s
      } else {
        nextInterval = 5000; // After that: check every 5s
      }

      try {
        const statusRes = await fetch(`/payments/status/${transactionRef}`);
        const statusData = await statusRes.json();

        if (statusData.status === "completed") {
          clearInterval(this.pollInterval);
          this.showStatus(
            `
              <div style="text-align: center;">
                <p style="margin: 0; font-weight: 600; color: #059669; font-size: 1.1rem;">✓ Payment Successful!</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  Your payment of KSh ${this.currentPaymentData.amount.toLocaleString()} has been received.
                </p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  Refreshing page...
                </p>
              </div>
            `,
            "success"
          );
          setTimeout(() => location.reload(), 2000);
        } else if (statusData.status === "failed") {
          clearInterval(this.pollInterval);
          this.showStatus(
            `
              <div style="text-align: center;">
                <p style="margin: 0; font-weight: 600; color: #DC2626;">✗ Payment Failed</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  The payment was cancelled or failed. This could be due to:
                </p>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.875rem; color: #6B7280; text-align: left;">
                  <li>Cancelled PIN entry</li>
                  <li>Insufficient M-Pesa balance</li>
                  <li>Wrong PIN entered</li>
                  <li>Transaction timeout</li>
                </ul>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  Please try again.
                </p>
              </div>
            `,
            "error"
          );
          this.payButton.disabled = false;
          this.payButton.textContent = "Send STK Push";
        } else if (attempts >= maxAttempts) {
          clearInterval(this.pollInterval);
          this.showStatus(
            `
              <div style="text-align: center;">
                <p style="margin: 0; font-weight: 600; color: #D97706;">⏱ Timeout</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  Payment verification is taking longer than expected.
                </p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6B7280;">
                  Please check your M-Pesa messages or try again.
                </p>
              </div>
            `,
            "warning"
          );
          this.payButton.disabled = false;
          this.payButton.textContent = "Send STK Push";
        } else {
          // Still pending, schedule next check
          this.pollInterval = setTimeout(poll, nextInterval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        attempts--;

        if (attempts < maxAttempts) {
          this.pollInterval = setTimeout(poll, nextInterval);
        } else {
          this.showStatus(
            "Error checking payment status. Please refresh the page.",
            "error"
          );
          this.payButton.disabled = false;
          this.payButton.textContent = "Send STK Push";
        }
      }
    };

    // Start first poll after 2 seconds
    this.pollInterval = setTimeout(poll, 2000);
  }

  showStatus(message, type = "") {
    if (!this.statusDiv) return;

    const className = type ? `alert-inline ${type}` : "alert-inline";
    this.statusDiv.innerHTML = `<div class="${className}">${message}</div>`;
  }
}

// Create global instance
const paymentModal = new PaymentModal();
