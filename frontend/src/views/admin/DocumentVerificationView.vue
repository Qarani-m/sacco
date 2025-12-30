<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const documents = ref([])
const loading = ref(true)

const fetchDocuments = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/documents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      documents.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch documents', err)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status) => {
  const colors = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    approved: { bg: '#D1FAE5', text: '#059669' },
    rejected: { bg: '#FEE2E2', text: '#DC2626' }
  }
  return colors[status] || { bg: '#F3F4F6', text: '#6B7280' }
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Document Verification</h1>
    </div>

    <div class="card">
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>Loading documents...</p>
      </div>

      <table v-else-if="documents.length > 0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left; border-bottom: 2px solid #E5E7EB;">
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Member</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Document Type</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Status</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Uploaded</th>
            <th style="padding: 0.75rem; text-align: right;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" style="border-bottom: 1px solid #F3F4F6;">
            <td style="padding: 1rem 0.75rem;">
              <div style="font-weight: 500;">{{ doc.memberName }}</div>
              <div style="font-size: 0.75rem; color: #6B7280;">{{ doc.memberEmail }}</div>
            </td>
            <td style="padding: 1rem 0.75rem;">{{ doc.documentType }}</td>
            <td style="padding: 1rem 0.75rem;">
              <span 
                :style="{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getStatusColor(doc.status).bg,
                  color: getStatusColor(doc.status).text
                }"
              >
                {{ doc.status }}
              </span>
            </td>
            <td style="padding: 1rem 0.75rem;">{{ new Date(doc.createdAt).toLocaleDateString() }}</td>
            <td style="padding: 1rem 0.75rem; text-align: right;">
              <router-link 
                :to="`/admin/documents/${doc.id}`"
                style="color: #2563EB; text-decoration: none; font-size: 0.875rem;"
              >
                View
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else style="color: #6B7280; text-align: center; padding: 2rem;">No documents found.</p>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
