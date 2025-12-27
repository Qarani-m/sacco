// Email Service for SACCO System
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.baseUrl = process.env.BASE_URL || "http://localhost:3000";

    // Initialize transporter
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send verification email with magic link
  async sendVerificationEmail(email, token, userName) {
    const verificationLink = `${this.baseUrl}/auth/verify/${token}`;

    const emailContent = {
      to: email,
      subject: "Verify Your SACCO Account",
      html: this.getVerificationEmailTemplate(userName, verificationLink),
      text: `Hello ${userName},\n\nWelcome to SACCO! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nSACCO Team`,
    };

console.log(emailContent);

    return await this.sendEmail(emailContent);
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, userName) {
    const resetLink = `${this.baseUrl}/auth/reset-password/${token}`;

    const emailContent = {
      to: email,
      subject: "Reset Your SACCO Password",
      html: this.getPasswordResetEmailTemplate(userName, resetLink),
      text: `Hello ${userName},\n\nYou requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nSACCO Team`,
    };

    return await this.sendEmail(emailContent);
  }

  // HTML template for verification email
  getVerificationEmailTemplate(userName, verificationLink) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000000; color: #FFFFFF; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #FFFFFF; }
        .button { display: inline-block; padding: 15px 30px; background: #000000; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; }
        .accent-line { height: 3px; background: #000000; width: 60px; margin: 0 auto 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-weight: 300; letter-spacing: 2px;">SACCO</h1>
        </div>
        <div class="content">
            <div class="accent-line"></div>
            <h2 style="font-weight: 300; font-size: 24px;">Verify Your Email</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Welcome to SACCO! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">VERIFY EMAIL</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 12px;">${verificationLink}</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #6B7280; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} SACCO System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
  }

  // HTML template for password reset email
  getPasswordResetEmailTemplate(userName, resetLink) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000000; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000000; color: #FFFFFF; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #FFFFFF; }
        .button { display: inline-block; padding: 15px 30px; background: #000000; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px; }
        .accent-line { height: 3px; background: #000000; width: 60px; margin: 0 auto 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-weight: 300; letter-spacing: 2px;">SACCO</h1>
        </div>
        <div class="content">
            <div class="accent-line"></div>
            <h2 style="font-weight: 300; font-size: 24px;">Reset Your Password</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">RESET PASSWORD</a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 12px;">${resetLink}</p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} SACCO System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
  }

  // Send email using Nodemailer
  async sendEmail(emailContent) {

    console.log(emailContent)
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email credentials not found in environment variables");
        if (this.isDevelopment) {
          console.log(
            "Mocking email send in dev mode due to missing credentials"
          );
          console.log("To:", emailContent.to);
          console.log("Subject:", emailContent.subject);
          return {
            success: true,
            message: "Email mocked (missing credentials)",
          };
        }
        return { success: false, message: "Email configuration missing" };
      }

      const info = await this.transporter.sendMail({
        from: `"SACCO System" <${process.env.EMAIL_USER}>`,
        to: emailContent.to,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      console.log("Email sent: %s", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
