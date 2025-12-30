<script setup>
import AuthLayout from '@/components/layout/AuthLayout.vue'
</script>

<template>
  <AuthLayout>
    <div class="auth-card">
      <div class="info-icon">📧</div>
      <h1 class="auth-title">Check Your Email</h1>
      <p class="auth-subtitle">
        We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
      </p>
      
      <div class="info-box">
        <p><strong>Didn't receive the email?</strong></p>
        <ul>
          <li>Check your spam folder</li>
          <li>Make sure you entered the correct email address</li>
          <li>Wait a few minutes and try again</li>
        </ul>
      </div>

      <router-link to="/auth/login" class="btn-secondary w-full">
        Back to Login
      </router-link>
    </div>
  </AuthLayout>
</template>

<style scoped>
.auth-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.info-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 1rem 0;
}

.auth-subtitle {
  color: #6B7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.info-box {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info-box p {
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  color: #374151;
}

.info-box ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.info-box li {
  margin: 0.5rem 0;
}

.btn-secondary {
  padding: 0.875rem 1.5rem;
  background: #6B7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s ease;
}

.btn-secondary:hover {
  background: #4B5563;
}

.w-full {
  width: 100%;
}
</style>
