<script setup>
import { ref } from 'vue'

const email = ref('')
const message = ref('')
const loading = ref(false)

const handleReset = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value })
        })
        if (res.ok) {
            message.value = 'If an account exists, a reset link has been sent.'
        } else {
            message.value = 'Request failed'
        }
    } catch(err) {
        message.value = 'Network error'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow border">
          <h1 class="text-2xl font-bold mb-4">Reset Password</h1>
          <div v-if="message" class="alert alert-info border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-700 mb-4">{{ message }}</div>
          
          <form @submit.prevent="handleReset" v-if="!message">
              <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Email Address</label>
                  <input type="email" v-model="email" required class="input-field">
              </div>
              <button class="w-full btn-primary" :disabled="loading">Send Reset Link</button>
          </form>
          
          <div class="mt-4 text-center">
              <router-link to="/auth/login" class="text-sm underline">Back to Login</router-link>
          </div>
      </div>
  </div>
</template>
