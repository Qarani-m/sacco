<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const message = ref(null)
const loading = ref(true)

const fetchMessage = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/messages/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      message.value = await response.json()
      // Mark as read
      if (!message.value.isRead) {
        await fetch(`/api/admin/messages/${route.params.id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
    }
  } catch (err) {
    console.error('Failed to fetch message', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessage()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Message Details</h1>
      <router-link to="/admin/messages" class="btn-secondary">← Back to Messages</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading message...</p>
    </div>

    <div v-else-if="message" class="card">
      <div class="message-header">
        <h2>{{ message.subject }}</h2>
        <p class="meta">From: <strong>{{ message.senderName }}</strong> ({{ message.senderEmail }})</p>
        <p class="meta">Date: {{ new Date(message.createdAt).toLocaleString() }}</p>
      </div>
      
      <div class="message-body">
        <p>{{ message.body }}</p>
      </div>
    </div>

    <div v-else class="card">
      <p>Message not found.</p>
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

.message-header {
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.message-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.meta {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.message-body {
  line-height: 1.6;
  color: #374151;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: #6B7280;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
