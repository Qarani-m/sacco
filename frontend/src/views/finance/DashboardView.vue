<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const stats = ref({
  totalRevenue: 0,
  disbursedLoans: 0,
  outstandingBalance: 0,
  collections: 0
})
const loading = ref(true)

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/finance/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch stats', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Finance Dashboard</h1>
      <p class="page-subtitle">Financial operations and reporting</p>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">KES {{ stats.totalRevenue.toLocaleString() }}</div>
        <div class="stat-meta">This month</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Disbursed Loans</div>
        <div class="stat-value">KES {{ stats.disbursedLoans.toLocaleString() }}</div>
        <div class="stat-meta">This month</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Outstanding Balance</div>
        <div class="stat-value">KES {{ stats.outstandingBalance.toLocaleString() }}</div>
        <div class="stat-meta">Total</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Collections</div>
        <div class="stat-value">KES {{ stats.collections.toLocaleString() }}</div>
        <div class="stat-meta">This month</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/admin/reports" class="action-card">
          <div class="action-title">Financial Reports</div>
          <div class="action-description">Generate and view reports</div>
        </router-link>

        <router-link to="/admin/loans" class="action-card">
          <div class="action-title">Loan Portfolio</div>
          <div class="action-description">View all loans</div>
        </router-link>

        <a href="#" class="action-card">
          <div class="action-title">Payment Tracking</div>
          <div class="action-description">Track all payments</div>
        </a>

        <a href="#" class="action-card">
          <div class="action-title">Reconciliation</div>
          <div class="action-description">Account reconciliation</div>
        </a>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="card">
      <h2 class="section-title">Recent Transactions</h2>
      <div class="empty-state">
        No recent transactions to display
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.page-subtitle {
  color: #6B7280;
  margin: 0.5rem 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.stat-meta {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  display: block;
  padding: 1.5rem;
  border: 2px solid #000;
  background: white;
  text-decoration: none;
  color: #000;
  transition: all 0.2s;
}

.action-card:hover {
  background: #000;
  color: white;
}

.action-title {
  font-weight: 600;
}

.action-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.action-card:hover .action-description {
  color: #D1D5DB;
}

.card {
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6B7280;
}
</style>
