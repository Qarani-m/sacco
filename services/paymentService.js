const axios = require("axios");

class PaymentService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseUrl =
      process.env.MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString("base64");
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error(
        "M-Pesa Access Token Error:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc = "Payment"
  ) {
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3);
      const password = Buffer.from(
        `${this.shortcode}${this.passkey}${timestamp}`
      ).toString("base64");

      // Format phone number (ensure 254 prefix)
      const formattedPhone = phoneNumber.startsWith("0")
        ? `254${phoneNumber.slice(1)}`
        : phoneNumber;

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.ceil(amount), // Ensure integer
          PartyA: formattedPhone,
          PartyB: this.shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: this.callbackUrl,
          AccountReference: accountReference,
          TransactionDesc: transactionDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "STK Push Error:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to initiate STK Push");
    }
  }
}

module.exports = new PaymentService();
