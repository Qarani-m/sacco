<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const router = useRouter()
const member = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
  idNumber: '',
  role: 'member'
})
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

const saveMember = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/members/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(member.value)
    })
    
    if (response.ok) {
      alert('Member updated successfully')
      router.push(`/admin/members/${route.params.id}`)
    } else {
      alert('Failed to update member')
    }
  } catch (err) {
    console.error('Failed to save member', err)
    alert('Failed to save member')
  }
}

onMounted(() => {
  fetchMember()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Edit Member</h1>
      <router-link :to="`/admin/members/${route.params.id}`" class="btn-secondary">Cancel</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading member...</p>
    </div>

    <div v-else class="card">
      <form @submit.prevent="saveMember">
        <div class="form-grid">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              v-model="member.fullName"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              v-model="member.email"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber"
              v-model="member.phoneNumber"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="idNumber">ID Number</label>
            <input 
              type="text" 
              id="idNumber"
              v-model="member.idNumber"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role"
              v-model="member.role"
              class="form-input"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="risk">Risk</option>
              <option value="disbursement">Disbursement</option>
              <option value="customer_service">Customer Service</option>
            </select>
          </div>
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
          <button type="submit" class="btn-primary">Save Changes</button>
          <router-link :to="`/admin/members/${route.params.id}`" class="btn-secondary">Cancel</router-link>
        </div>
      </form>
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563EB;
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
