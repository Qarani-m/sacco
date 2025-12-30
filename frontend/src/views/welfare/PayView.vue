<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"
import PaymentModal from '@/components/PaymentModal.vue'

const showPaymentModal = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const openPaymentModal = () => {
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const handlePaymentSuccess = () => {
  alert('Welfare payment successful!')
  closePaymentModal()
}
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <h1 class="page-title">Pay Welfare</h1>
    </div>

    <div class="card">
      <h2 class="section-title">Welfare Contribution</h2>
      <p class="description">
        Make your monthly welfare contribution to support fellow members in times of need.
      </p>

      <div class="amount-box">
        <label>Amount</label>
        <p class="amount">KSh 300</p>
        <p class="note">(Testing: KSh 3)</p>
      </div>

      <button @click="openPaymentModal" class="btn-primary">
        Pay Welfare Contribution
      </button>
    </div>

    <PaymentModal
      :show="showPaymentModal"
      title="Pay Welfare Contribution"
      :amount="3"
      category="welfare"
      :user-id="user.id"
      :user-phone="user.phoneNumber || user.phone_number"
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
    />
  </DashboardLayout>
</template>

<style scoped>
.page-header {
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
  margin: 0 0 1rem 0;
}

.description {
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.amount-box {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.amount-box label {
  font-size: 0.875rem;
  color: #6B7280;
  display: block;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.note {
  font-size: 0.75rem;
  color: #DC2626;
  margin: 0.5rem 0 0 0;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #1F2937;
}
</style>
