<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const document = ref(null)
const loading = ref(true)

const fetchDocument = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/documents/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      document.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch document', err)
  } finally {
    loading.value = false
  }
}

const approveDocument = async () => {
  if (!confirm('Approve this document?')) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/documents/${route.params.id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      alert('Document approved')
      await fetchDocument()
    }
  } catch (err) {
    console.error('Failed to approve document', err)
    alert('Failed to approve document')
  }
}

const rejectDocument = async () => {
  const reason = prompt('Enter rejection reason:')
  if (!reason) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/documents/${route.params.id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })
    
    if (response.ok) {
      alert('Document rejected')
      await fetchDocument()
    }
  } catch (err) {
    console.error('Failed to reject document', err)
    alert('Failed to reject document')
  }
}

onMounted(() => {
  fetchDocument()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Document View</h1>
      <router-link to="/admin/documents" class="btn-secondary">← Back</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading document...</p>
    </div>

    <div v-else-if="document" class="card">
      <div class="info-grid">
        <div class="info-item">
          <label>Member</label>
          <p>{{ document.memberName }}</p>
        </div>
        <div class="info-item">
          <label>Document Type</label>
          <p>{{ document.documentType }}</p>
        </div>
        <div class="info-item">
          <label>Status</label>
          <p>{{ document.status }}</p>
        </div>
        <div class="info-item">
          <label>Uploaded</label>
          <p>{{ new Date(document.createdAt).toLocaleString() }}</p>
        </div>
      </div>

      <div v-if="document.fileUrl" style="margin-top: 2rem;">
        <h3 class="section-title">Document Preview</h3>
        <a :href="document.fileUrl" target="_blank" class="btn-primary">View Document</a>
      </div>

      <div v-if="document.status === 'pending'" style="margin-top: 2rem; display: flex; gap: 1rem;">
        <button @click="approveDocument" class="btn-approve">Approve</button>
        <button @click="rejectDocument" class="btn-reject">Reject</button>
      </div>
    </div>

    <div v-else class="card">
      <p>Document not found.</p>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.info-item p {
  font-weight: 500;
  color: #000;
  margin: 0;
}

.btn-primary, .btn-secondary, .btn-approve, .btn-reject {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #2563EB;
  color: white;
}

.btn-secondary {
  background: #6B7280;
  color: white;
}

.btn-approve {
  background: #10B981;
  color: white;
}

.btn-reject {
  background: #EF4444;
  color: white;
}
</style>
