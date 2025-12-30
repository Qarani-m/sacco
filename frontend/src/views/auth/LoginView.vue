<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await res.json()
    
    if (res.ok) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (data.user.role === 'admin' || data.user.role === 'staff') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      error.value = data.message || 'Login failed'
    }
  } catch (err) {
    error.value = 'Network error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">Welcome Back</h1>
        <p class="text-gray-500">Sign in to your SACCO account</p>
      </div>

      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            v-model="email" 
            required
            class="input-field"
            placeholder="member@example.com"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            v-model="password" 
            required
            class="input-field"
            placeholder="••••••••"
          >
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center">
            <input type="checkbox" class="mr-2"> Remember me
          </label>
          <router-link to="/auth/forgot-password" class="text-blue-600 hover:underline">Forgot password?</router-link>
        </div>

        <button 
          type="submit" 
          class="w-full btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Don't have an account? 
        <router-link to="/auth/register" class="text-black font-semibold hover:underline">Register now</router-link>
      </p>
    </div>
  </div>
</template>
