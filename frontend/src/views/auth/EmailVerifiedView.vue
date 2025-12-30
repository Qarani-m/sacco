<script setup>
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()

const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <AuthLayout>
    <div class="auth-card">
      <div class="success-icon">✓</div>
      <h1 class="auth-title">Email Verified!</h1>
      <p class="auth-subtitle">
        Your email has been successfully verified. You can now log in to your account.
      </p>
      
      <button @click="goToLogin" class="btn-primary w-full">
        Go to Login
      </button>
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

.success-icon {
  width: 64px;
  height: 64px;
  background: #10B981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
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

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #1F2937;
}

.w-full {
  width: 100%;
}
</style>
