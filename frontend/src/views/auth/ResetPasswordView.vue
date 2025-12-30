<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = route.query.token || route.params.token
    const response = await fetch(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })

    const data = await response.json()

    if (response.ok) {
      router.push('/auth/reset-success')
    } else {
      error.value = data.message || 'Failed to reset password'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="auth-card">
      <div class="text-center mb-6">
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle">Enter your new password below</p>
      </div>

      <form @submit.prevent="resetPassword" class="space-y-6">
        <div class="form-group">
          <label for="password">New Password</label>
          <input 
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="••••••••"
            minlength="6"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirm New Password</label>
          <input 
            type="password"
            id="confirm_password"
            v-model="confirmPassword"
            required
            placeholder="••••••••"
            minlength="6"
            class="form-input"
          >
        </div>

        <div v-if="error" class="alert-error">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <div class="text-center mt-6 pt-6 border-t border-gray-200">
        <p class="text-secondary">
          Remember your password?
          <router-link to="/auth/login" class="link-primary">Login</router-link>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.auth-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.text-center {
  text-align: center;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.pt-6 {
  padding-top: 1.5rem;
}

.border-t {
  border-top-width: 1px;
}

.border-gray-200 {
  border-color: #E5E7EB;
}

.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  color: #6B7280;
  margin: 0;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563EB;
}

.alert-error {
  padding: 0.875rem 1rem;
  background: #FEE2E2;
  border-left: 3px solid #EF4444;
  border-radius: 6px;
  color: #991B1B;
  font-size: 0.875rem;
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

.btn-primary:hover:not(:disabled) {
  background: #1F2937;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.w-full {
  width: 100%;
}

.text-secondary {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

.link-primary {
  color: #2563EB;
  text-decoration: none;
  font-weight: 500;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>
