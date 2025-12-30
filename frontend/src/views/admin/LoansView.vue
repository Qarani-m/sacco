<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const loans = ref([])
const statusFilter = ref('')
const loading = ref(true)

const fetchLoans = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const url = statusFilter.value 
      ? `/api/admin/loans?status=${statusFilter.value}`
      : '/api/admin/loans'
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      loans.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch loans', err)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    active: { bg: '#DBEAFE', text: '#2563EB' },
    paid: { bg: '#D1FAE5', text: '#059669' },
    rejected: { bg: '#FEE2E2', text: '#DC2626' }
  }
  return colors[status] || { bg: '#F3F4F6', text: '#6B7280' }
}

onMounted(() => {
  fetchLoans()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Loan Management</h1>
    </div>

    <div class="card">
      <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
        <select 
          v-model="statusFilter"
          style="padding: 0.5rem; border: 1px solid #E5E7EB; border-radius: 4px;"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          @click="fetchLoans"
          style="padding: 0.5rem 1rem; background: #2563EB; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Filter
        </button>
      </div>

      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>Loading loans...</p>
      </div>

      <table v-else-if="loans.length > 0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left; border-bottom: 2px solid #E5E7EB;">
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Borrower</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Requested</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Approved</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Balance</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Status</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Months</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Date</th>
            <th style="padding: 0.75rem; text-align: right;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in loans" :key="loan.id" style="border-bottom: 1px solid #F3F4F6;">
            <td style="padding: 1rem 0.75rem;">
              <div style="font-weight: 500;">{{ loan.borrowerName }}</div>
              <div style="font-size: 0.75rem; color: #6B7280;">{{ loan.borrowerEmail }}</div>
            </td>
            <td style="padding: 1rem 0.75rem;">KSh {{ loan.requestedAmount?.toLocaleString() }}</td>
            <td style="padding: 1rem 0.75rem;">
              {{ loan.approvedAmount ? 'KSh ' + loan.approvedAmount.toLocaleString() : '-' }}
            </td>
            <td style="padding: 1rem 0.75rem;">
              {{ loan.balanceRemaining ? 'KSh ' + loan.balanceRemaining.toLocaleString() : '-' }}
            </td>
            <td style="padding: 1rem 0.75rem;">
              <span 
                :style="{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getStatusColor(loan.status).bg,
                  color: getStatusColor(loan.status).text
                }"
              >
                {{ loan.status === 'pending' && loan.approvalCount !== null 
                    ? `Pending ${loan.approvalCount}/3` 
                    : loan.status }}
              </span>
            </td>
            <td style="padding: 1rem 0.75rem;">{{ loan.repaymentMonths }}</td>
            <td style="padding: 1rem 0.75rem;">{{ new Date(loan.createdAt).toLocaleDateString() }}</td>
            <td style="padding: 1rem 0.75rem; text-align: right;">
              <router-link 
                :to="`/admin/loans/${loan.id}`"
                style="color: #2563EB; text-decoration: none; font-size: 0.875rem;"
              >
                View
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else style="color: #6B7280; text-align: center; padding: 2rem;">No loans found.</p>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #000;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
