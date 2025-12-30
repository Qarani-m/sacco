<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const allocations = ref([
    { type: 'Share Capital', percentage: 40 },
    { type: 'Savings', percentage: 60 }
])
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">Allocate Payment</h1>
      </div>
      
      <div class="card max-w-lg">
          <p class="mb-4">Configure how your deposits are split automatically.</p>
          <div v-for="(a, i) in allocations" :key="i" class="mb-4">
              <label class="block mb-1">{{ a.type }}</label>
              <input type="range" v-model="a.percentage" class="w-full">
              <div class="text-right text-sm font-bold">{{ a.percentage }}%</div>
          </div>
          <button class="btn-primary">Save Preferences</button>
      </div>
  </DashboardLayout>
</template>
