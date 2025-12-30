<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"
import TransactionTable from '@/components/ui/TransactionTable.vue'

const history = ref([])
const form = ref({ amount: 300, period: new Date().toISOString().slice(0, 7) }) // YYYY-MM
const message = ref('')

const fetchHistory = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/welfare/history', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) history.value = await res.json()
}

const payWelfare = async () => {
     const token = localStorage.getItem('token')
     const res = await fetch('/api/welfare/pay', {
         method: 'POST',
         headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(form.value)
     })
     if (res.ok) {
         message.value = "Payment Successful"
         fetchHistory()
     } else {
         message.value = "Payment Failed"
     }
}

onMounted(() => fetchHistory())
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Welfare Fund</h1>
    </div>

    <div class="grid grid-cols-2 gap-8 mb-8">
        <div class="card">
            <h2 class="section-title mb-6">Contribute</h2>
            <div v-if="message" class="alert alert-info">{{ message }}</div>
            <form @submit.prevent="payWelfare">
                <div class="form-group">
                    <label>Amount (KES)</label>
                    <input type="number" v-model="form.amount" disabled class="bg-gray-100">
                    <p class="text-xs text-gray-500 mt-1">Fixed monthly contribution</p>
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <input type="month" v-model="form.period" required>
                </div>
                <button class="btn-primary">Pay Now</button>
            </form>
        </div>
        
        <div class="card bg-blue-50">
            <h2 class="section-title mb-4">About Welfare</h2>
            <p class="mb-4">The Benevolent Fund covers members and their immediate family in case of demise.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li>Member: KES 50,000</li>
                <li>Spouse: KES 25,000</li>
                <li>Child: KES 25,000</li>
                <li>Parent: KES 20,000</li>
            </ul>
        </div>
    </div>

    <div class="card">
        <h2 class="section-title mb-6">Payment History</h2>
        <!-- Adapting TransactionTable slightly or just raw table since fields differ -->
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in history" :key="item.id">
                    <td>{{ new Date(item.paymentDate).toLocaleDateString() }}</td>
                    <td>{{ item.period }}</td>
                    <td>KES {{ item.amount }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </DashboardLayout>
</template>
