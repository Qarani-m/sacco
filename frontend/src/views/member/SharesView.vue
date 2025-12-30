<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const history = ref([])
const stats = ref({ totalShares: 0, totalValue: 0 })
const loading = ref(true)
const purchaseForm = ref({ quantity: 1 })
const processing = ref(false)
const message = ref('')

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }
    
    const [statsRes, historyRes] = await Promise.all([
      fetch('/api/shares/total', { headers }),
      fetch('/api/shares/history', { headers })
    ])
    
    if (statsRes.ok) stats.value = await statsRes.json()
    if (historyRes.ok) history.value = await historyRes.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const buyShares = async () => {
  processing.value = true
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/shares/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: purchaseForm.value.quantity })
    })
    
    if (res.ok) {
      message.value = 'Shares purchased successfully!'
      fetchData() // Refresh
      purchaseForm.value.quantity = 1
    } else {
      message.value = 'Purchase failed.'
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
      <h1 class="page-title">My Shares</h1>
    </div>

    <div class="grid grid-cols-2 gap-8 mb-12">
      <!-- Purchase Card -->
      <div class="card">
        <h2 class="section-title mb-6">Buy Shares</h2>
        <div v-if="message" class="alert alert-info">{{ message }}</div>
        
        <form @submit.prevent="buyShares">
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" v-model="purchaseForm.quantity" min="1" required>
          </div>
          <p class="mb-4 text-secondary">Total Cost: KSh {{ (purchaseForm.quantity * 500).toLocaleString() }}</p>
          <button class="btn-primary" :disabled="processing">
            {{ processing ? 'Processing...' : 'Confirm Purchase' }}
          </button>
        </form>
      </div>

      <!-- Stats Card -->
      <div class="card bg-gray-50">
        <h2 class="section-title mb-6">Overview</h2>
        <div class="mb-6">
          <p class="text-sm uppercase text-gray-500">Total Shares</p>
          <p class="text-4xl font-light">{{ stats.totalShares }}</p>
        </div>
        <div>
          <p class="text-sm uppercase text-gray-500">Total Value</p>
          <p class="text-4xl font-light">KES {{ stats.totalValue.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- History -->
    <div class="card">
      <h2 class="section-title mb-6">Share History</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Quantity</th>
            <th>Amount Paid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>{{ new Date(item.purchaseDate).toLocaleDateString() }}</td>
            <td>{{ item.quantity }}</td>
            <td>KES {{ item.amountPaid.toLocaleString() }}</td>
            <td><span class="text-xs uppercase font-bold">{{ item.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>
