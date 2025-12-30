<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"
import PaymentModal from '@/components/PaymentModal.vue'

const route = useRoute()
const router = useRouter()
const showPaymentModal = ref(false)
const amount = ref(0)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const openPaymentModal = () => {
  if (!amount.value || amount.value <= 0) {
    alert('Please enter a valid amount')
    return
  }
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const handlePaymentSuccess = () => {
  alert('Payment successful!')
  router.push('/loans')
}
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <h1 class="page-title">Repay Loan</h1>
      <router-link :to="`/loans/${route.params.id}`" class="btn-secondary">← Back</router-link>
    </div>

    <div class="card">
      <h2 class="section-title">Make Loan Payment</h2>
      
      <div class="form-group">
        <label for="amount">Payment Amount (KSh)</label>
        <input 
          type="number"
          id="amount"
          v-model="amount"
          placeholder="Enter amount"
          min="1"
          class="form-input"
        >
      </div>

      <button @click="openPaymentModal" class="btn-primary">
        Proceed to Payment
      </button>
    </div>

    <PaymentModal
      :show="showPaymentModal"
      title="Repay Loan"
      :amount="amount"
      category="loan_repayment"
      :user-id="user.id"
      :user-phone="user.phoneNumber || user.phone_number"
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
    />
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

.btn-secondary {
  background: #6B7280;
  color: white;
}
</style>
