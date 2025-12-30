<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const tickets = ref([
    { id: 1, subject: 'Login Issue', user: 'Member #123', status: 'open' },
    { id: 2, subject: 'Loan Inquiry', user: 'Member #456', status: 'closed' }
])
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">Customer Service</h1>
      </div>
      
      <div class="card">
          <h3 class="font-bold mb-4">Support Tickets</h3>
          <table class="table">
              <thead>
                  <tr>
                      <th>Subject</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="t in tickets" :key="t.id">
                      <td>{{ t.subject }}</td>
                      <td>{{ t.user }}</td>
                      <td>
                          <span :class="t.status === 'open' ? 'text-green-600' : 'text-gray-500'">
                              {{ t.status }}
                          </span>
                      </td>
                      <td><button class="text-blue-600 underline">View</button></td>
                  </tr>
              </tbody>
          </table>
      </div>
  </DashboardLayout>
</template>
