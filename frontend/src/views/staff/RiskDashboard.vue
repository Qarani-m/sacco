<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const riskStats = ref({
    highRiskLoans: 5,
    portfolioRisk: 'Medium',
    defaultRate: '3.2%'
})
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Risk Assessment</h1>
      <p class="page-subtitle">Department: Risk</p>
    </div>

    <div class="grid grid-cols-3 gap-6">
        <div class="stat-card">
            <p class="stat-label">Portfolio Risk</p>
            <p class="stat-value text-yellow-600">{{ riskStats.portfolioRisk }}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">High Risk Loans</p>
            <p class="stat-value">{{ riskStats.highRiskLoans }}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Default Rate</p>
            <p class="stat-value">{{ riskStats.defaultRate }}</p>
        </div>
    </div>
  </DashboardLayout>
</template>
