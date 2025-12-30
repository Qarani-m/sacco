<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const loan = ref(null)
const loading = ref(true)

const fetchLoanDetail = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/loans/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      loan.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch loan details', err)
  } finally {
    loading.value = false
  }
}

const approveLoan = async () => {
  if (!confirm('Approve this loan?')) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/loans/${route.params.id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      alert('Loan approved successfully')
      await fetchLoanDetail()
    }
  } catch (err) {
    console.error('Failed to approve loan', err)
    alert('Failed to approve loan')
  }
}

const rejectLoan = async () => {
  const reason = prompt('Enter rejection reason:')
  if (!reason) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/loans/${route.params.id}/reject`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })
    
    if (response.ok) {
      alert('Loan rejected')
      await fetchLoanDetail()
    }
  } catch (err) {
    console.error('Failed to reject loan', err)
    alert('Failed to reject loan')
  }
}

onMounted(() => {
  fetchLoanDetail()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Loan Details</h1>
      <router-link to="/admin/loans" class="btn-secondary">← Back to Loans</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading loan details...</p>
    </div>

    <div v-else-if="loan" class="card">
      <h2 class="section-title">Loan Information</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <label>Borrower</label>
          <p>{{ loan.borrowerName }}</p>
        </div>
        <div class="info-item">
          <label>Email</label>
          <p>{{ loan.borrowerEmail }}</p>
        </div>
        <div class="info-item">
          <label>Requested Amount</label>
          <p>KSh {{ loan.requestedAmount?.toLocaleString() }}</p>
        </div>
        <div class="info-item">
          <label>Approved Amount</label>
          <p>{{ loan.approvedAmount ? 'KSh ' + loan.approvedAmount.toLocaleString() : 'Pending' }}</p>
        </div>
        <div class="info-item">
          <label>Balance Remaining</label>
          <p>{{ loan.balanceRemaining ? 'KSh ' + loan.balanceRemaining.toLocaleString() : '-' }}</p>
        </div>
        <div class="info-item">
          <label>Repayment Period</label>
          <p>{{ loan.repaymentMonths }} months</p>
        </div>
        <div class="info-item">
          <label>Status</label>
          <p>{{ loan.status }}</p>
        </div>
        <div class="info-item">
          <label>Created</label>
          <p>{{ new Date(loan.createdAt).toLocaleString() }}</p>
        </div>
      </div>

      <div v-if="loan.guarantors && loan.guarantors.length > 0" style="margin-top: 2rem;">
        <h3 class="section-title">Guarantors</h3>
        <div v-for="g in loan.guarantors" :key="g.id" class="guarantor-item">
          <p><strong>{{ g.guarantorName }}</strong></p>
          <p>Shares Pledged: {{ g.sharesPledged }}</p>
        </div>
      </div>

      <div v-if="loan.status === 'pending'" style="margin-top: 2rem; display: flex; gap: 1rem;">
        <button @click="approveLoan" class="btn-primary">Approve Loan</button>
        <button @click="rejectLoan" class="btn-danger">Reject Loan</button>
      </div>
    </div>

    <div v-else class="card">
      <p>Loan not found.</p>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #000;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.info-item p {
  font-weight: 500;
  color: #000;
  margin: 0;
}

.guarantor-item {
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.guarantor-item p {
  margin: 0.25rem 0;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #10B981;
  color: white;
}

.btn-secondary {
  background: #6B7280;
  color: white;
}

.btn-danger {
  background: #EF4444;
  color: white;
}
</style>
