<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

// Mock Data for Admin Reports
const reportType = ref('financial')
const reportData = ref(null)

const generateReport = () => {
    // In real app, fetch /api/reports?type=...
    reportData.value = {
        generatedAt: new Date(),
        summary: "Financial Performance Q4",
        items: [
            { label: "Total Revenue", value: 1500000 },
            { label: "Total Loans", value: 4500000 },
            { label: "Default Rate", value: "2.5%" }
        ]
    }
}
</script>

<template>
  <DashboardLayout>
     <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Reports</h1>
    </div>

    <div class="card mb-8">
        <h2 class="section-title mb-4">Generate Report</h2>
        <div class="flex gap-4">
            <select v-model="reportType" class="p-2 border rounded">
                <option value="financial">Financial Overview</option>
                <option value="loans">Loan Performance</option>
                <option value="membership">Membership Growth</option>
            </select>
            <button @click="generateReport" class="btn-primary" style="width: auto">Generate</button>
        </div>
    </div>

    <div v-if="reportData" class="card">
        <h2 class="section-title mb-4">{{ reportData.summary }}</h2>
        <p class="text-xs text-gray-500 mb-6">Generated on {{ reportData.generatedAt.toLocaleString() }}</p>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, idx) in reportData.items" :key="idx">
                    <td>{{ item.label }}</td>
                    <td class="font-bold">{{ item.value.toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>

  </DashboardLayout>
</template>
