import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/dashboard' },

        // Auth Routes
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('../views/auth/LoginView.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('../views/auth/RegisterView.vue')
        },
        {
            path: '/auth/forgot-password',
            name: 'forgot-password',
            component: () => import('../views/auth/ForgotPasswordView.vue')
        },
        {
            path: '/auth/verify-email',
            name: 'verify-email',
            component: () => import('../views/auth/VerifyEmailView.vue')
        },
        {
            path: '/auth/email-verified',
            name: 'email-verified',
            component: () => import('../views/auth/EmailVerifiedView.vue')
        },
        {
            path: '/auth/forgot-password-sent',
            name: 'forgot-password-sent',
            component: () => import('../views/auth/ForgotPasswordSentView.vue')
        },
        {
            path: '/auth/resend-verification',
            name: 'resend-verification',
            component: () => import('../views/auth/ResendVerificationView.vue')
        },
        {
            path: '/auth/reset-password/:token',
            name: 'reset-password',
            component: () => import('../views/auth/ResetPasswordView.vue')
        },
        {
            path: '/auth/reset-success',
            name: 'reset-success',
            component: () => import('../views/auth/ResetSuccessView.vue')
        },

        // Member Routes
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/member/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/media/profile', // Using /media just to separate or keep consistent 
            name: 'member-profile',
            component: () => import('../views/member/ProfileView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/shares',
            name: 'shares',
            component: () => import('../views/member/SharesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/shares/buy',
            name: 'shares-buy',
            component: () => import('../views/shares/BuyView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/savings',
            name: 'savings',
            component: () => import('../views/member/SavingsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans',
            name: 'loans',
            component: () => import('../views/member/LoansView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans/request',
            name: 'loan-request',
            component: () => import('../views/member/LoanRequestView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans/:id',
            name: 'loan-detail',
            component: () => import('../views/member/LoanDetailView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans/:id/details',
            name: 'loan-details',
            component: () => import('../views/loans/DetailsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans/:id/repay',
            name: 'loan-repay',
            component: () => import('../views/loans/RepayView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/loans/new-request',
            name: 'loan-new-request',
            component: () => import('../views/loans/RequestView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/guarantors/requests',
            name: 'guarantor-requests',
            component: () => import('../views/member/GuarantorRequestsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/welfare',
            name: 'welfare',
            component: () => import('../views/member/WelfareView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/welfare/pay',
            name: 'welfare-pay',
            component: () => import('../views/welfare/PayView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/messages',
            name: 'messages',
            component: () => import('../views/member/MessagesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/notifications',
            name: 'notifications',
            component: () => import('../views/admin/NotificationsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/member/allocate',
            name: 'allocate-payment',
            component: () => import('../views/member/AllocatePaymentView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/member/pay-registration',
            name: 'pay-registration',
            component: () => import('../views/member/PayRegistrationView.vue'),
            meta: { requiresAuth: true }
        },

        // Admin & Staff Routes
        {
            path: '/admin/dashboard',
            name: 'admin-dashboard',
            component: () => import('../views/admin/DashboardView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/members',
            name: 'admin-members',
            component: () => import('../views/admin/MembersView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/reports',
            name: 'admin-reports',
            component: () => import('../views/admin/ReportsView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/documents',
            name: 'admin-documents',
            component: () => import('../views/admin/DocumentsView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/documents/:id',
            name: 'admin-document-view',
            component: () => import('../views/admin/DocumentViewView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/document-verification',
            name: 'admin-document-verification',
            component: () => import('../views/admin/DocumentVerificationView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/loans',
            name: 'admin-loans',
            component: () => import('../views/admin/LoansView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/loans/:id',
            name: 'admin-loan-detail',
            component: () => import('../views/admin/LoanDetailView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/members/:id',
            name: 'admin-member-detail',
            component: () => import('../views/admin/MemberDetailView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/members/:id/edit',
            name: 'admin-member-edit',
            component: () => import('../views/admin/MemberEditView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/messages',
            name: 'admin-messages',
            component: () => import('../views/admin/MessagesView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/messages/:id',
            name: 'admin-message-detail',
            component: () => import('../views/admin/MessageDetailView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/pending-actions',
            name: 'admin-pending-actions',
            component: () => import('../views/admin/PendingActionsView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/roles',
            name: 'admin-roles',
            component: () => import('../views/admin/roles/RolesIndexView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/admin/roles/:id',
            name: 'admin-role-detail',
            component: () => import('../views/admin/roles/RoleDetailView.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/finance/dashboard',
            name: 'finance-dashboard',
            component: () => import('../views/finance/DashboardView.vue'),
            meta: { requiresAuth: true, role: 'finance' }
        },
        {
            path: '/risk/dashboard',
            name: 'risk-dashboard',
            component: () => import('../views/risk/DashboardView.vue'),
            meta: { requiresAuth: true, role: 'risk' }
        },
        {
            path: '/staff/disbursement',
            name: 'disbursement-dashboard',
            component: () => import('../views/staff/DisbursementDashboard.vue'),
            meta: { requiresAuth: true, role: 'disbursement' }
        },
        {
            path: '/staff/customer-service',
            name: 'customer-service-dashboard',
            component: () => import('../views/staff/CustomerServiceDashboard.vue'),
            meta: { requiresAuth: true, role: 'customer_service' }
        },

        // Error Routes
        {
            path: '/403',
            name: 'forbidden',
            component: () => import('../views/errors/ForbiddenView.vue')
        },
        {
            path: '/registration-required',
            name: 'registration-required',
            component: () => import('../views/errors/RegistrationRequiredView.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/errors/NotFoundView.vue')
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/auth/login')
    } else {
        next()
    }
})

export default router
