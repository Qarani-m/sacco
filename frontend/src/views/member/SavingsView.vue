<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const history = ref([])
const stats = ref({}) // expected { totalSavings: 1000 }
const loading = ref(true)
const form = ref({ type: 'deposit', amount: 500 })
const processing = ref(false)
const message = ref('')

const fetchData = async () => {
    // Similar to SharesView
     try {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }
    
    const [statsRes, historyRes] = await Promise.all([
      fetch('/api/savings/total', { headers }),
      fetch('/api/savings/history', { headers })
    ])
    
    if (statsRes.ok) stats.value = await statsRes.json()
    if (historyRes.ok) history.value = await historyRes.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleTransaction = async () => {
  processing.value = true
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    const endpoint = form.value.type === 'deposit' ? '/api/savings/deposit' : '/api/savings/withdraw'
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: form.value.amount, description: 'Manual ' + form.value.type })
    })
    
    if (res.ok) {
      message.value = 'Transaction successful!'
      fetchData()
    } else {
        const err = await res.json() // basic error handling
      message.value = 'Failed: ' + (err.message || 'Unknown error')
    }
  } catch (err) {
    message.value = 'Error processing request.'
  } finally {
    processing.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <DashboardLayout>
     <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Savings Account</h1>
    </div>

    <div class="grid grid-cols-2 gap-8 mb-12">
        <div class="card">
             <h2 class="section-title mb-6">Transact</h2>
             <div v-if="message" class="alert alert-info">{{ message }}</div>
             <form @submit.prevent="handleTransaction">
                 <div class="form-group">
                     <label>Transaction Type</label>
                     <select v-model="form.type">
                         <option value="deposit">Deposit</option>
                         <option value="withdraw">Withdraw</option>
                     </select>
                 </div>
                 <div class="form-group">
                     <label>Amount</label>
                     <input type="number" v-model="form.amount" min="100" required>
                 </div>
                 <button class="btn-primary" :disabled="processing">Submit</button>
             </form>
        </div>
        
        <div class="card bg-gray-50">
            <h2 class="section-title mb-6">Balance</h2>
            <p class="text-4xl font-light">KES {{ (stats.totalSavings || 0).toLocaleString() }}</p>
        </div>
    </div>

    <div class="card">
        <h2 class="section-title mb-6">History</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in history" :key="item.id">
                    <td>{{ new Date(item.transactionDate).toLocaleDateString() }}</td>
                    <td style="text-transform: capitalize">{{ item.transactionType }}</td>
                    <td :style="{ color: item.amount < 0 ? 'red' : 'green' }">KES {{ Math.abs(item.amount).toLocaleString() }}</td>
                    <td>{{ item.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </DashboardLayout>
</template>
