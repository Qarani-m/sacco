<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const router = useRouter()
const stats = ref({ totalShares: 0 })
const form = ref({ amount: 1000, repaymentMonths: 1 })
const processing = ref(false)
const message = ref('')
const maxLoan = ref(0)
const loading = ref(true)

const fetchEligibility = async () => {
    try {
         const token = localStorage.getItem('token')
         const res = await fetch('/api/shares/total', {
             headers: { 'Authorization': `Bearer ${token}` }
         })
         if (res.ok) {
             const data = await res.json()
             stats.value = data
             // Logic mirrors backend: 3x shares (assuming share price 500)
             // Backend uses ShareService.getAvailableShares * 500 * 3
             // For UI feedback we approximate:
             const sharePrice = 500
             maxLoan.value = (data.totalShares * sharePrice * 3)
         }
    } catch(err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

const submitLoan = async () => {
  processing.value = true
  message.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/loans/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form.value)
    })
    
    if (res.ok) {
      router.push('/loans')
    } else {
      const err = await res.json()
      message.value = 'Error: ' + (err.message || 'Loan request failed')
    }
  } catch (err) {
    message.value = 'System error occurred.'
  } finally {
    processing.value = false
  }
}

onMounted(() => fetchEligibility())
</script>

<template>
  <DashboardLayout>
    <div class="container-sm">
        <h1 class="page-title mb-8">Request a Loan</h1>
        
        <div class="card">
             <div v-if="message" class="alert alert-error">{{ message }}</div>
             
             <div class="alert alert-info mb-6">
                 <p class="text-sm font-bold">Eligibility Limit: KES {{ maxLoan.toLocaleString() }}</p>
                 <p class="text-xs">Based on your shares (3x multiplier)</p>
             </div>

             <form @submit.prevent="submitLoan">
                 <div class="form-group">
                     <label>Amount (KES)</label>
                     <input type="number" v-model="form.amount" :max="maxLoan" required>
                 </div>
                 
                 <div class="form-group">
                     <label>Repayment Period (Months)</label>
                     <select v-model="form.repaymentMonths">
                         <option v-for="n in 6" :key="n" :value="n">{{ n }} Months</option>
                     </select>
                 </div>
                 
                 <div class="bg-gray-50 p-4 mb-6 rounded">
                     <div class="flex justify-between mb-2">
                         <span class="text-secondary">Interest Rate</span>
                         <span class="font-bold">10% Flat</span>
                     </div>
                     <div class="flex justify-between mb-2">
                         <span class="text-secondary">Total Interest</span>
                         <span>KES {{ (form.amount * 0.1).toLocaleString() }}</span>
                     </div>
                     <div class="flex justify-between border-t pt-2 mt-2">
                         <span class="font-bold">Total Repayment</span>
                         <span class="font-bold">KES {{ (form.amount * 1.1).toLocaleString() }}</span>
                     </div>
                 </div>

                 <div class="flex gap-4">
                     <router-link to="/loans" class="btn-secondary text-center">Cancel</router-link>
                     <button class="btn-primary" :disabled="processing">Submit Application</button>
                 </div>
             </form>
        </div>
    </div>
  </DashboardLayout>
</template>
