<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const disbursements = ref([
    { id: 1, loanId: 'LN-1234', amount: 50000, recipient: 'John Doe', status: 'pending' },
    { id: 2, loanId: 'LN-5678', amount: 20000, recipient: 'Jane Smith', status: 'processing' }
])
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">Disbursement Dashboard</h1>
      </div>
      
      <div class="card">
          <h3 class="font-bold mb-4">Pending Disbursements</h3>
          <table class="table">
              <thead>
                  <tr>
                      <th>Loan ID</th>
                      <th>Recipient</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="d in disbursements" :key="d.id">
                      <td>{{ d.loanId }}</td>
                      <td>{{ d.recipient }}</td>
                      <td>KES {{ d.amount.toLocaleString() }}</td>
                      <td><span class="badge badge-warning">{{ d.status }}</span></td>
                      <td><button class="btn-small">Process</button></td>
                  </tr>
              </tbody>
          </table>
      </div>
  </DashboardLayout>
</template>
