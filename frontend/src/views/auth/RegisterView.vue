<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
})
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.value.fullName,
        email: form.value.email,
        phoneNumber: form.value.phoneNumber,
        password: form.value.password
      })
    })

    const data = await res.json()

    if (res.ok) {
      router.push('/auth/login?registered=true')
    } else {
      error.value = data.message || 'Registration failed'
    }
  } catch (err) {
    error.value = 'Network error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">Create Account</h1>
        <p class="text-gray-500">Join the SACCO today</p>
      </div>

      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" v-model="form.fullName" required class="input-field">
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
           <input type="email" v-model="form.email" required class="input-field">
        </div>
        
        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
           <input type="text" v-model="form.phoneNumber" required class="input-field" placeholder="07...">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" v-model="form.password" required class="input-field">
        </div>
        
         <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input type="password" v-model="form.confirmPassword" required class="input-field">
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Already have an account? 
        <router-link to="/auth/login" class="text-black font-semibold hover:underline">Sign in</router-link>
      </p>
    </div>
  </div>
</template>
