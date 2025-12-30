<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const form = ref({ amount: 1000, shares: 2 })

const calculate = () => {
    form.value.shares = form.value.amount / 500
}
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">Purchase Shares</h1>
      </div>
      
      <div class="card max-w-md">
          <form @submit.prevent>
              <div class="form-group">
                  <label>Amount (KES)</label>
                  <input type="number" v-model="form.amount" @input="calculate" class="input-field">
              </div>
              <div class="form-group">
                  <label>Equivalent Shares</label>
                  <input type="text" :value="form.shares" disabled class="bg-gray-100 input-field">
                  <p class="text-xs text-gray-500 mt-1">1 Share = KES 500</p>
              </div>
              <button class="btn-primary w-full">Proceed to Pay</button>
          </form>
      </div>
  </DashboardLayout>
</template>
