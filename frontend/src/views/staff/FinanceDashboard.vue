<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const stats = ref({
    totalDisbursed: 2500000,
    pendingDisbursements: 3,
    nextPayout: '2025-01-05'
})
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Finance Dashboard</h1>
      <p class="page-subtitle">Department: Finance</p>
    </div>

    <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="stat-card">
            <p class="stat-label">Total Disbursed</p>
            <p class="stat-value">KES {{ stats.totalDisbursed.toLocaleString() }}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Pending</p>
            <p class="stat-value">{{ stats.pendingDisbursements }} Approvals</p>
        </div>
         <div class="stat-card">
            <p class="stat-label">Next Payout</p>
            <p class="stat-value">{{ stats.nextPayout }}</p>
        </div>
    </div>
  </DashboardLayout>
</template>
