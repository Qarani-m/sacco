<script setup>
import { ref } from 'vue'

const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-xl shadow border text-center">
          <h1 class="text-2xl font-bold mb-4">Registration Fee</h1>
          <p class="text-gray-600 mb-6">
              To activate your membership, a one-time fee of <strong>KES 1,000</strong> is required.
          </p>
          
           <div class="bg-gray-100 p-4 rounded text-left mb-6">
               <p class="font-bold mb-2">Payment Instructions:</p>
               <ol class="list-decimal pl-5 space-y-1 text-sm">
                   <li>Go to M-PESA</li>
                   <li>Paybill: <strong>123456</strong></li>
                   <li>Account: <strong>REG-{{ user.id?.substring(0,8) }}</strong></li>
               </ol>
           </div>
           
           <button class="btn-primary w-full">I Have Paid</button>
           <button class="mt-4 text-gray-500 underline text-sm">Log Out</button>
      </div>
  </div>
</template>
