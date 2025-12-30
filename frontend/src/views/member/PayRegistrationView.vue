<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const methods = ref(['M-Pesa', 'Bank Transfer'])
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">Pay Registration</h1>
      </div>
      
      <div class="card">
          <h3 class="font-bold mb-4">Select Payment Method</h3>
          <div class="grid grid-cols-2 gap-4">
              <button v-for="m in methods" :key="m" class="p-6 border rounded-lg hover:border-black hover:bg-gray-50">
                  {{ m }}
              </button>
          </div>
      </div>
  </DashboardLayout>
</template>
