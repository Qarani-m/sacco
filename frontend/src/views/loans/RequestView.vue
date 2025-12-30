<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const router = useRouter()
const form = ref({
  amount: '',
  repaymentMonths: 6,
  purpose: ''
})
const loading = ref(false)
const error = ref('')

const submitRequest = async () => {
  if (!form.value.amount || !form.value.purpose) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/loans/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      alert('Loan request submitted successfully!')
      router.push('/loans')
    } else {
      const data = await response.json()
      error.value = data.message || 'Failed to submit loan request'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <h1 class="page-title">Request Loan</h1>
      <router-link to="/loans" class="btn-secondary">← Back</router-link>
    </div>

    <div class="card">
      <h2 class="section-title">Loan Application</h2>
      
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="amount">Loan Amount (KSh)</label>
          <input 
            type="number"
            id="amount"
            v-model="form.amount"
            required
            placeholder="Enter amount"
            min="1"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="repaymentMonths">Repayment Period (Months)</label>
          <select 
            id="repaymentMonths"
            v-model="form.repaymentMonths"
            class="form-input"
          >
            <option value="1">1 Month</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months</option>
            <option value="4">4 Months</option>
            <option value="5">5 Months</option>
            <option value="6">6 Months</option>
          </select>
        </div>

        <div class="form-group">
          <label for="purpose">Loan Purpose</label>
          <textarea 
            id="purpose"
            v-model="form.purpose"
            required
            placeholder="Describe the purpose of this loan"
            rows="4"
            class="form-input"
          ></textarea>
        </div>

        <div v-if="error" class="alert-error">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Submit Loan Request' }}
        </button>
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
  max-width: 600px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563EB;
}

textarea.form-input {
  resize: vertical;
}

.alert-error {
  padding: 0.875rem 1rem;
  background: #FEE2E2;
  border-left: 3px solid #EF4444;
  border-radius: 6px;
  color: #991B1B;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.875rem 1.5rem;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6B7280;
  color: white;
}
</style>
