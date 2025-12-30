const fs = require('fs');
const path = require('path');

// EJS files found
const ejsFiles = [
    'admin/dashboard.ejs',
    'admin/documents.ejs',
    'admin/document-verification.ejs',
    'admin/document-view.ejs',
    'admin/loan-detail.ejs',
    'admin/loans.ejs',
    'admin/member-detail.ejs',
    'admin/member-edit.ejs',
    'admin/members.ejs',
    'admin/message-detail.ejs',
    'admin/messages.ejs',
    'admin/notifications.ejs',
    'admin/pending-actions.ejs',
    'admin/register.ejs',
    'admin/reports.ejs',
    'admin/roles/index.ejs',
    'admin/roles/view.ejs',
    'auth/email-verified.ejs',
    'auth/forgot-password.ejs',
    'auth/forgot-password-sent.ejs',
    'auth/login.ejs',
    'auth/resend-verification.ejs',
    'auth/reset-password.ejs',
    'auth/reset-success.ejs',
    'auth/verify-email.ejs',
    'customer-service/dashboard.ejs',
    'disbursement/dashboard.ejs',
    'errors/403.ejs',
    'errors/404.ejs',
    'errors/500.ejs',
    'errors/registration-required.ejs',
    'finance/dashboard.ejs',
    'loans/details.ejs',
    'loans/repay.ejs',
    'loans/request.ejs',
    'member/allocate-payment.ejs',
    'member/dashboard.ejs',
    'member/guarantor-requests.ejs',
    'member/loan-detail.ejs',
    'member/loan-request.ejs',
    'member/loans.ejs',
    'member/messages.ejs',
    'member/pay-registration.ejs',
    'member/profile.ejs',
    'member/registration-fee.ejs',
    'member/savings.ejs',
    'member/shares.ejs',
    'member/welfare.ejs',
    'payments/mpesa-prompt.ejs',
    'risk/dashboard.ejs',
    'shares/buy.ejs',
    'staff/customer-service-dashboard.ejs',
    'staff/disbursement-dashboard.ejs',
    'staff/finance-dashboard.ejs',
    'staff/risk-dashboard.ejs',
    'welfare/pay.ejs'
];

// Vue files found
const vueFiles = [
    'admin/DashboardView.vue',
    'admin/DocumentsView.vue',
    'admin/MembersView.vue',
    'admin/NotificationsView.vue',
    'admin/ReportsView.vue',
    'auth/ForgotPasswordView.vue',
    'auth/LoginView.vue',
    'auth/RegisterView.vue',
    'auth/VerifyEmailView.vue',
    'customer-service/DashboardView.vue',
    'disbursement/DashboardView.vue',
    'errors/ForbiddenView.vue',
    'errors/NotFoundView.vue',
    'errors/RegistrationRequiredView.vue',
    'errors/ServerErrorView.vue',
    'member/AllocatePaymentView.vue',
    'member/DashboardView.vue',
    'member/GuarantorRequestsView.vue',
    'member/LoanDetailView.vue',
    'member/LoanRequestView.vue',
    'member/LoansView.vue',
    'member/MessagesView.vue',
    'member/PayRegistrationView.vue',
    'member/ProfileView.vue',
    'member/RegistrationFeeView.vue',
    'member/SavingsView.vue',
    'member/SharesView.vue',
    'member/WelfareView.vue',
    'payments/MpesaPromptView.vue',
    'shares/BuyView.vue',
    'staff/FinanceDashboard.vue',
    'staff/RiskDashboard.vue'
];

// Normalize file names for comparison
function normalizeFileName(fileName) {
    // Remove extension
    const withoutExt = fileName.replace(/\.(ejs|vue)$/, '');
    // Convert to lowercase
    const lower = withoutExt.toLowerCase();
    // Remove 'View' suffix from Vue files
    const withoutView = lower.replace(/view$/, '');
    // Convert kebab-case to regular
    return withoutView.replace(/-/g, '');
}

// Create mapping
const ejsMap = new Map();
ejsFiles.forEach(file => {
    const normalized = normalizeFileName(file);
    ejsMap.set(normalized, file);
});

const vueMap = new Map();
vueFiles.forEach(file => {
    const normalized = normalizeFileName(file);
    vueMap.set(normalized, file);
});

// Find missing files
const missingInVue = [];
const extraInVue = [];

ejsMap.forEach((ejsFile, key) => {
    if (!vueMap.has(key)) {
        missingInVue.push(ejsFile);
    }
});

vueMap.forEach((vueFile, key) => {
    if (!ejsMap.has(key)) {
        extraInVue.push(vueFile);
    }
});

// Generate report
console.log('='.repeat(80));
console.log('EJS TO VUE MIGRATION COMPARISON REPORT');
console.log('='.repeat(80));
console.log();
console.log(`Total EJS files: ${ejsFiles.length}`);
console.log(`Total Vue files: ${vueFiles.length}`);
console.log();

if (missingInVue.length === 0) {
    console.log('✅ ALL EJS FILES HAVE BEEN MIGRATED TO VUE!');
} else {
    console.log(`❌ MISSING IN VUE (${missingInVue.length} files):`);
    console.log('='.repeat(80));
    missingInVue.forEach(file => {
        console.log(`  - ${file}`);
    });
}

console.log();

if (extraInVue.length > 0) {
    console.log(`ℹ️  EXTRA FILES IN VUE (${extraInVue.length} files):`);
    console.log('='.repeat(80));
    extraInVue.forEach(file => {
        console.log(`  - ${file}`);
    });
}

console.log();
console.log('='.repeat(80));
console.log('DETAILED MAPPING:');
console.log('='.repeat(80));

// Group by category
const categories = {};
ejsFiles.forEach(file => {
    const category = file.split('/')[0];
    if (!categories[category]) {
        categories[category] = { ejs: [], vue: [] };
    }
    categories[category].ejs.push(file);
});

vueFiles.forEach(file => {
    const category = file.split('/')[0];
    if (!categories[category]) {
        categories[category] = { ejs: [], vue: [] };
    }
    categories[category].vue.push(file);
});

Object.keys(categories).sort().forEach(category => {
    console.log();
    console.log(`📁 ${category.toUpperCase()}`);
    console.log('-'.repeat(80));
    console.log(`  EJS files: ${categories[category].ejs.length}`);
    console.log(`  Vue files: ${categories[category].vue.length}`);

    const ejsInCategory = categories[category].ejs;
    const vueInCategory = categories[category].vue;

    const ejsNormalized = new Set(ejsInCategory.map(normalizeFileName));
    const vueNormalized = new Set(vueInCategory.map(normalizeFileName));

    const missingInCat = ejsInCategory.filter(f => !vueNormalized.has(normalizeFileName(f)));

    if (missingInCat.length > 0) {
        console.log(`  ❌ Missing in Vue:`);
        missingInCat.forEach(f => console.log(`     - ${f}`));
    } else {
        console.log(`  ✅ All files migrated`);
    }
});

console.log();
console.log('='.repeat(80));
