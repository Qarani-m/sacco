<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow border text-center">
          <div class="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h1 class="text-2xl font-bold mb-2">Registration Required</h1>
          <p class="text-gray-500 mb-6">
              You must pay the registration fee before accessing member services.
          </p>
          <div class="bg-gray-50 p-4 rounded mb-6 text-sm text-left">
              <p>1. Go to your MPESA menu</p>
              <p>2. Select Paybill</p>
              <p>3. Enter Business No: <strong>123456</strong></p>
              <p>4. Account No: <strong>REG-{{ user.id?.substring(0,6) }}</strong></p>
              <p>5. Enter Amount: <strong>KES 1000</strong></p>
          </div>
          <button @click="$router.push('/dashboard')" class="btn-primary w-full">I've Paid</button>
      </div>
  </div>
</template>

<script setup>
const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>
