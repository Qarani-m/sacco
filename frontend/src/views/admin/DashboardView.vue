<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const user = JSON.parse(localStorage.getItem('user') || '{}')
const stats = ref({
    totalMembers: 0,
    activeLoans: 0,
    totalSavings: 0,
    outstandingLoans: 0
})

const fetchData = async () => {
    // In a real app we'd fetch /api/admin/stats
    // Mocking for migration completeness
    stats.value = {
        totalMembers: 150,
        activeLoans: 45,
        totalSavings: 5000000,
        outstandingLoans: 2500000
    }
}

onMounted(() => fetchData())
</script>

<template>
  <DashboardLayout>
     <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Staff Portal</h1>
      <p class="page-subtitle">Role: {{ user.role }}</p>
    </div>

    <!-- Admin/Staff Widgets -->
    <div class="grid grid-cols-4 gap-6 mb-12">
        <div class="stat-card">
            <p class="stat-label">Total Members</p>
            <p class="stat-value">{{ stats.totalMembers }}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Total Savings</p>
            <p class="stat-value">KES {{ (stats.totalSavings/1000000).toFixed(1) }}M</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Active Loans</p>
            <p class="stat-value">{{ stats.activeLoans }}</p>
        </div>
        <div class="stat-card">
            <p class="stat-label">Outstanding</p>
            <p class="stat-value">KES {{ (stats.outstandingLoans/1000000).toFixed(1) }}M</p>
        </div>
    </div>
    
    <div class="card">
        <h2 class="section-title mb-6">Staff Actions</h2>
        <div class="grid grid-cols-3 gap-6">
            <div class="card-hover text-center p-6 border rounded cursor-pointer">
                <h3 class="font-bold">Member Management</h3>
                <p class="text-sm text-gray-500">View and approve members</p>
            </div>
             <div class="card-hover text-center p-6 border rounded cursor-pointer">
                <h3 class="font-bold">Loan Approvals</h3>
                <p class="text-sm text-gray-500">Process pending applications</p>
            </div>
             <div class="card-hover text-center p-6 border rounded cursor-pointer">
                <h3 class="font-bold">Reports</h3>
                <p class="text-sm text-gray-500">Generate financial reports</p>
            </div>
        </div>
    </div>

  </DashboardLayout>
</template>
