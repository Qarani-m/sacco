<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const user = JSON.parse(localStorage.getItem('user') || '{}')
const stats = ref({
  shares: { totalShares: 0, totalValue: 0 },
  savings: { totalSavings: 0 },
  loans: [],
  transactions: []
})
const loading = ref(true)

const activeLoans = computed(() => {
  return stats.value.loans.filter(l => ['active', 'approved', 'pending'].includes(l.status))
})

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const [sharesRes, savingsRes, loansRes, txRes] = await Promise.all([
      fetch('/api/shares/total', { headers }),
      fetch('/api/savings/total', { headers }),
      fetch('/api/loans/my-loans', { headers }),
      fetch('/api/payments/history', { headers })
    ])

    if (sharesRes.ok) stats.value.shares = await sharesRes.json()
    if (savingsRes.ok) stats.value.savings = await savingsRes.json()
    if (loansRes.ok) stats.value.loans = await loansRes.json()
    if (txRes.ok) stats.value.transactions = await txRes.json()

  } catch (err) {
    console.error('Failed to fetch dashboard data', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DashboardLayout>
    <!-- Welcome Header -->
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Welcome, {{ user.fullName }}</h1>
      <p class="page-subtitle">Member Dashboard</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center" style="padding: 4rem;">
      <p>Loading dashboard...</p>
    </div>

    <div v-else>
      <!-- Registration Alert -->
      <!-- Assuming backend user entity has registrationPaid field, but we might need to refresh user profile -->
      <!-- For now, we use the local storage user, which might be stale. Ideal: /api/auth/me -->
      
      <!-- Stats Grid -->
      <div class="mb-12">
        <h2 class="section-title mb-6">Financial Overview</h2>
        <div class="grid grid-cols-4 gap-6">
          
          <!-- Shares -->
          <div class="stat-card">
            <p class="stat-label">My Shares</p>
            <p class="stat-value">{{ stats.shares.totalShares }}</p>
            <p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">
              Worth KSh {{ stats.shares.totalValue.toLocaleString() }}
            </p>
            <router-link to="/shares" class="btn-small" style="margin-top: 1rem;">Buy Shares</router-link>
          </div>

          <!-- Savings -->
          <div class="stat-card">
            <p class="stat-label">Personal Savings</p>
            <p class="stat-value">KSh {{ stats.savings.totalSavings.toLocaleString() }}</p>
            <p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">
              Surplus from payments
            </p>
            <router-link to="/savings" class="btn-small" style="margin-top: 1.5rem;">View Details</router-link>
          </div>

          <!-- Active Loans -->
          <div class="stat-card">
            <p class="stat-label">Active Loans</p>
            <p class="stat-value">{{ activeLoans.length }}</p>
            <p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">
              Current Status
            </p>
            
            <div style="margin-top: 1rem;">
               <router-link v-if="activeLoans.length === 0" to="/loans" class="btn-small">Request Loan</router-link>
               <router-link v-else to="/loans" class="btn-small-outline">View Loans</router-link>
            </div>
          </div>

          <!-- Welfare (Mocked/Placeholder as we didn't implement specialized Welfare endpoint yet) -->
          <div class="stat-card">
            <p class="stat-label">Welfare</p>
            <p class="stat-value">Active</p>
             <p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">
              Standard plan
            </p>
            <button class="btn-small" style="margin-top: 1rem;">Pay Welfare</button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
       <div class="mb-12">
          <h2 class="section-title mb-6">Quick Actions</h2>
          <div class="grid grid-cols-3 gap-6">
             <router-link to="/shares" class="card-hover text-center no-underline block">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                <p style="font-weight: 600; color: #000000;">Buy Shares</p>
             </router-link>
             <router-link to="/loans" class="card-hover text-center no-underline block">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">💵</div>
                <p style="font-weight: 600; color: #000000;">Request Loan</p>
             </router-link>
              <div class="card-hover text-center no-underline block cursor-pointer">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏥</div>
                <p style="font-weight: 600; color: #000000;">Pay Welfare</p>
             </div>
          </div>
      </div>

      <!-- Recent Transactions -->
      <div class="mb-12">
        <h2 class="section-title mb-6">Recent Transactions</h2>
        <div v-if="stats.transactions.length > 0" class="card" style="padding: 0; overflow: hidden;">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in stats.transactions.slice(0, 5)" :key="tx.id">
                <td>{{ new Date(tx.createdAt).toLocaleDateString() }}</td>
                <td style="text-transform: capitalize;">{{ tx.category || tx.type }}</td>
                <td>KSh {{ tx.amount.toLocaleString() }}</td>
                <td>
                   <span class="text-meta" :style="{ color: tx.status === 'completed' ? '#10B981' : '#F59E0B' }">
                     {{ tx.status }}
                   </span>
                </td>
                <td class="text-secondary">{{ tx.reference }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="card text-center text-secondary">
          <p>No transactions found.</p>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<style scoped>
.no-underline { text-decoration: none; }
.block { display: block; }
.cursor-pointer { cursor: pointer; }
</style>
