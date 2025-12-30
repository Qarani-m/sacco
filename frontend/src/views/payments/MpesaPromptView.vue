<script setup>
import { ref } from 'vue'

defineProps(['amount', 'phone'])
defineEmits(['close'])

const sending = ref(false)
const sent = ref(false)

const initiate = () => {
    sending.value = true
    setTimeout(() => {
        sending.value = false
        sent.value = true
    }, 2000)
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl max-w-sm w-full text-center">
          <div v-if="!sent">
              <h3 class="text-xl font-bold mb-2">Confirm Payment</h3>
              <p class="mb-4 text-gray-600">Checking your phone ({{ phone }})...</p>
              <div v-if="sending" class="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-2xl font-bold mb-6">KES {{ amount }}</p>
              <button @click="initiate" class="btn-primary w-full mb-2">Simulate STK Push</button>
              <button @click="$emit('close')" class="btn-secondary w-full">Cancel</button>
          </div>
          <div v-else>
              <div class="text-green-500 text-5xl mb-2">✓</div>
              <h3 class="text-xl font-bold mb-2">Request Sent</h3>
              <p class="text-gray-500 mb-6">Check your phone to complete the transaction.</p>
              <button @click="$emit('close')" class="btn-primary w-full">Close</button>
          </div>
      </div>
  </div>
</template>
