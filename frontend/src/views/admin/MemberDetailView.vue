<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const member = ref(null)
const loading = ref(true)

const fetchMember = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/members/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      member.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch member', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMember()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Member Details</h1>
      <div style="display: flex; gap: 1rem;">
        <router-link :to="`/admin/members/${route.params.id}/edit`" class="btn-primary">Edit</router-link>
        <router-link to="/admin/members" class="btn-secondary">← Back</router-link>
      </div>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading member details...</p>
    </div>

    <div v-else-if="member" class="card">
      <h2 class="section-title">Personal Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Full Name</label>
          <p>{{ member.fullName }}</p>
        </div>
        <div class="info-item">
          <label>Email</label>
          <p>{{ member.email }}</p>
        </div>
        <div class="info-item">
          <label>Phone Number</label>
          <p>{{ member.phoneNumber }}</p>
        </div>
        <div class="info-item">
          <label>ID Number</label>
          <p>{{ member.idNumber }}</p>
        </div>
        <div class="info-item">
          <label>Registration Status</label>
          <p>{{ member.registrationPaid ? 'Paid' : 'Pending' }}</p>
        </div>
        <div class="info-item">
          <label>Email Verified</label>
          <p>{{ member.emailVerified ? 'Yes' : 'No' }}</p>
        </div>
        <div class="info-item">
          <label>Member Since</label>
          <p>{{ new Date(member.createdAt).toLocaleDateString() }}</p>
        </div>
        <div class="info-item">
          <label>Role</label>
          <p>{{ member.role }}</p>
        </div>
      </div>

      <h2 class="section-title" style="margin-top: 2rem;">Financial Summary</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Total Shares</label>
          <p>{{ member.totalShares || 0 }}</p>
        </div>
        <div class="info-item">
          <label>Total Savings</label>
          <p>KSh {{ member.totalSavings?.toLocaleString() || 0 }}</p>
        </div>
        <div class="info-item">
          <label>Active Loans</label>
          <p>{{ member.activeLoans || 0 }}</p>
        </div>
        <div class="info-item">
          <label>Loan Balance</label>
          <p>KSh {{ member.loanBalance?.toLocaleString() || 0 }}</p>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <p>Member not found.</p>
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
  background: #2563EB;
  color: white;
}

.btn-secondary {
  background: #6B7280;
  color: white;
}
</style>
