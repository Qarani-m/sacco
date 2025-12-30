<script setup>
defineProps({
  transactions: {
    type: Array,
    required: true
  },
  showLimit: {
    type: Number,
    default: 0
  }
})

const formatDate = (date) => new Date(date).toLocaleDateString()
const formatAmount = (amount) => amount.toLocaleString()
</script>

<template>
  <div class="card" style="padding: 0; overflow: hidden;">
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Ref</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tx in (showLimit ? transactions.slice(0, showLimit) : transactions)" :key="tx.id">
          <td>{{ formatDate(tx.createdAt) }}</td>
          <td style="text-transform: capitalize;">{{ tx.category || tx.type }}</td>
          <td>KES {{ formatAmount(tx.amount) }}</td>
          <td>
             <!-- Basic Status Badge -->
             <span class="text-xs uppercase font-bold" 
                   :style="{ color: tx.status === 'completed' ? '#10B981' : '#F59E0B' }">
               {{ tx.status }}
             </span>
          </td>
          <td class="text-secondary">{{ tx.reference }}</td>
        </tr>
        <tr v-if="transactions.length === 0">
           <td colspan="5" class="text-center text-secondary py-4">No transactions found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
