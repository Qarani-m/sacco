<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const status = ref('verifying') // verifying, success, error

onMounted(async () => {
    const token = route.query.token
    if (!token) {
        status.value = 'error'
        return
    }
    
    try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        if (res.ok) {
            status.value = 'success'
        } else {
            status.value = 'error'
        }
    } catch(err) {
        status.value = 'error'
    }
})
</script>

<template>
   <div class="min-h-screen flex items-center justify-center bg-gray-50">
       <div class="max-w-md w-full bg-white p-8 text-center rounded-xl shadow">
           <div v-if="status === 'verifying'">
               <div class="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
               <p>Verifying your email...</p>
           </div>
           
           <div v-else-if="status === 'success'">
               <div class="text-green-500 text-4xl mb-2">✓</div>
               <h2 class="text-xl font-bold mb-2">Email Verified</h2>
               <p class="text-gray-500 mb-6">Your account is now active.</p>
               <router-link to="/auth/login" class="btn-primary">Proceed to Login</router-link>
           </div>
           
           <div v-else>
               <div class="text-red-500 text-4xl mb-2">✕</div>
               <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
               <p class="text-gray-500 mb-6">The link may be invalid or expired.</p>
               <router-link to="/auth/login" class="btn-secondary">Back to Login</router-link>
           </div>
       </div>
   </div>
</template>
