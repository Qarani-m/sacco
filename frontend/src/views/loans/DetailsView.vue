<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const loan = ref(null)
const loading = ref(true)

const fetchLoan = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/loans/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      loan.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch loan', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLoan()
})
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <h1 class="page-title">Loan Details</h1>
      <router-link to="/loans" class="btn-secondary">← Back</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading...</p>
    </div>

    <div v-else-if="loan" class="card">
      <div class="info-grid">
        <div class="info-item">
          <label>Requested Amount</label>
          <p>KSh {{ loan.requestedAmount?.toLocaleString() }}</p>
        </div>
        <div class="info-item">
          <label>Approved Amount</label>
          <p>{{ loan.approvedAmount ? 'KSh ' + loan.approvedAmount.toLocaleString() : 'Pending' }}</p>
        </div>
        <div class="info-item">
          <label>Balance</label>
          <p>KSh {{ loan.balanceRemaining?.toLocaleString() || 0 }}</p>
        </div>
        <div class="info-item">
          <label>Status</label>
          <p>{{ loan.status }}</p>
        </div>
      </div>

      <div v-if="loan.status === 'active'" style="margin-top: 2rem;">
        <router-link :to="`/loans/${loan.id}/repay`" class="btn-primary">Make Payment</router-link>
      </div>
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

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #000;
  color: white;
}

.btn-secondary {
  background: #6B7280;
  color: white;
}
</style>
