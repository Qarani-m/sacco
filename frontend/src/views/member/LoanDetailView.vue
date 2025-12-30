<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const loanId = route.params.id
const loan = ref(null)
const transactions = ref([])

onMounted(async () => {
    // Mock fetch
    // const res = await fetch(`/api/loans/${route.id}`)
    loan.value = { 
        id: route.id, 
        amount: 50000, 
        balance: 25000, 
        status: 'active', 
        nextRepayment: '2025-02-01',
        history: [
            { date: '2025-01-01', amount: 5000, type: 'repayment' }
        ]
    }
})
</script>

<template>
  <DashboardLayout>
      <div v-if="loan">
          <div class="page-header">
             <div class="accent-line"></div>
             <h1 class="page-title">Loan #{{ loan.id }}</h1>
             <span class="px-2 py-1 text-xs uppercase bg-green-100 text-green-800 rounded ml-4">{{ loan.status }}</span>
          </div>
          
          <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="card">
                  <p class="text-sm text-gray-500">Original Amount</p>
                  <p class="text-xl font-bold">KES {{ loan.amount.toLocaleString() }}</p>
              </div>
              <div class="card">
                  <p class="text-sm text-gray-500">Outstanding Balance</p>
                  <p class="text-xl font-bold text-red-600">KES {{ loan.balance.toLocaleString() }}</p>
              </div>
          </div>
          
          <div class="card">
              <h3 class="font-bold mb-4">Repayment History</h3>
              <table class="table w-full">
                  <thead>
                      <tr>
                          <th class="text-left">Date</th>
                          <th class="text-left">Amount</th>
                          <th class="text-left">Type</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="(tx, i) in loan.history" :key="i">
                          <td>{{ tx.date }}</td>
                          <td>KES {{ tx.amount.toLocaleString() }}</td>
                          <td class="capitalize">{{ tx.type }}</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
      <div v-else class="text-center py-12">Loading...</div>
  </DashboardLayout>
</template>
