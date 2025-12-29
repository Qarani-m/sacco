# SACCO Management System

A comprehensive financial management platform for SACCO operations, supporting member management, loans, shares, savings, and welfare contributions.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build CSS
npm run build
```

## 📋 Feature Implementation Status

### ✅ Completed Features
- [x] Member registration and authentication
- [x] Loan application and tracking
- [x] Guarantorship approval system
- [x] Share capital management
- [x] Personal savings tracking
- [x] Welfare contributions
- [x] M-Pesa payment integration
- [x] Notification system
- [x] Admin action approval (2/3 majority)
- [x] Transaction history
- [x] Shares, savings, and welfare separation

### 🔄 In Progress
- [x] **Bulk Payment Allocation Fix** ✅ Complete
  - [x] Implement minimum share capital threshold (KES 5,000)
  - [x] Stop share deductions once minimum reached
  - [x] Redirect excess to savings
  - [x] Configurable deduction priorities

- [x] **Role-Based Access Control (RBAC)** ✅ Backend Complete
  - [x] Support multiple roles (Admin, Finance, Risk, Customer Service, Disbursement, Member)
  - [x] Configurable permissions per role
  - [x] Role-based module access
  - [ ] Role-based report filtering (frontend)
  - [ ] Role management UI (frontend)

- [x] **Role-Based Loan Approval Workflow** ✅ Backend Complete
  - [x] Configurable approval workflows
  - [x] Role-based approval routing
  - [x] Prevent self-approval
  - [x] Support approval by loan amount

- [x] **Member Self-Service Payment Allocation** ✅ Complete
  - [x] Payment allocation form
  - [x] Member-controlled fund distribution
  - [x] Real-time total calculation
  - [x] Single M-Pesa transaction

### 📅 Planned Features (Client Feedback)

#### High Priority
- [ ] **Role-Based Access Control (RBAC)**
  - [ ] Support multiple roles (Admin, Finance, Risk, Customer Service, Disbursement, Member)
  - [ ] Configurable permissions per role
  - [ ] Role-based module access
  - [ ] Role-based report filtering

- [ ] **Bulk Payment Allocation Fix**
  - [ ] Implement minimum share capital threshold (KES 5,000)
  - [ ] Stop share deductions once minimum reached
  - [ ] Redirect excess to savings
  - [ ] Configurable deduction priorities

- [ ] **Role-Based Loan Approval Workflow**
  - [ ] Configurable approval workflows
  - [ ] Role-based approval routing
  - [ ] Prevent self-approval
  - [ ] Support approval by loan amount

#### Medium Priority
- [ ] **Member Self-Service Payment Allocation**
  - [ ] Payment allocation form
  - [ ] Member-controlled fund distribution
  - [ ] Real-time total calculation
  - [ ] Single M-Pesa transaction

#### Deferred (Future Phase)
- [ ] **USSD Integration**
  - [ ] USSD menu system
  - [ ] Step-by-step payment allocation
  - [ ] USSD gateway integration

## 🏗️ Project Structure

```
sacco/
├── src/                    # Backend source code
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── config/            # Configuration
│   ├── views/             # EJS templates
│   └── app.js             # Express app
├── public/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JS
│   └── images/           # Images
├── data/                  # Database files
├── uploads/               # User uploads
└── server.js              # Entry point
```

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL / SQLite (fallback)
- **Views:** EJS templates
- **Styling:** Tailwind CSS
- **Payments:** M-Pesa API integration
- **Authentication:** JWT + HTTP-only cookies

## 📝 Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sacco
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url
```

## 👥 Default Users

```
Admin:
Email: admin@sacco.com
Password: Admin@123

Member:
Email: member@sacco.com
Password: Member@123
```

## 📚 Documentation

- [Feature Tracker](/.gemini/antigravity/brain/afb5ea58-823f-401a-8aa1-54d1b65f50d6/feature_tracker.md) - Detailed feature implementation tracking
- [Walkthrough](/.gemini/antigravity/brain/afb5ea58-823f-401a-8aa1-54d1b65f50d6/walkthrough.md) - Recent changes and cleanup

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Seed database
npm run seed-sqlite
```

## 📄 License

ISC

---

**Last Updated:** 2025-12-29  
**Version:** 1.0.0
