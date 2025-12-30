<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const loans = ref([])
const loading = ref(true)

const fetchData = async () => {
    try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }
        const res = await fetch('/api/loans/my-loans', { headers })
        if (res.ok) loans.value = await res.json()
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

onMounted(() => fetchData())
</script>

<template>
  <DashboardLayout>
     <div class="page-header flex justify-between items-center">
      <div>
         <div class="accent-line"></div>
         <h1 class="page-title">My Loans</h1>
      </div>
      <router-link to="/loans/request" class="btn-primary" style="width: auto;">Request New Loan</router-link>
    </div>

    <div v-if="loans.length === 0 && !loading" class="card text-center p-12">
        <p class="text-secondary">You have no loan history.</p>
    </div>

    <div class="grid gap-6">
        <div v-for="loan in loans" :key="loan.id" class="card border-l-4" :style="{ borderLeftColor: loan.status === 'active' ? '#000' : '#ccc' }">
             <div class="flex justify-between items-start">
                 <div>
                     <h3 class="text-lg font-bold">Loan #{{ loan.id.substring(0,8) }}</h3>
                     <p class="text-sm text-gray-500">{{ new Date(loan.createdAt).toLocaleDateString() }}</p>
                 </div>
                 <span class="px-2 py-1 text-xs uppercase font-bold bg-gray-100 rounded">{{ loan.status }}</span>
             </div>
             
             <div class="grid grid-cols-4 gap-4 mt-4">
                 <div>
                     <p class="text-xs uppercase text-gray-500">Requested</p>
                     <p class="font-medium">KES {{ loan.requestedAmount.toLocaleString() }}</p>
                 </div>
                 <div v-if="loan.approvedAmount">
                     <p class="text-xs uppercase text-gray-500">Approved</p>
                     <p class="font-medium">KES {{ loan.approvedAmount.toLocaleString() }}</p>
                 </div>
                 <div v-if="loan.balanceRemaining">
                     <p class="text-xs uppercase text-gray-500">Balance</p>
                     <p class="font-medium">KES {{ loan.balanceRemaining.toLocaleString() }}</p>
                 </div>
                  <div>
                     <p class="text-xs uppercase text-gray-500">Repayment</p>
                     <p class="font-medium">{{ loan.repaymentMonths }} Months</p>
                 </div>
             </div>
        </div>
    </div>
  </DashboardLayout>
</template>
