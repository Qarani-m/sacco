<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const messages = ref([])
const unreadCount = ref(0)
const loading = ref(true)

const fetchMessages = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      messages.value = data.messages || data
      unreadCount.value = messages.value.filter(m => !m.isRead).length
    }
  } catch (err) {
    console.error('Failed to fetch messages', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Messages</h1>
      <router-link to="/admin/messages/new" class="btn-primary">New Message</router-link>
    </div>

    <div class="card">
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>Loading messages...</p>
      </div>

      <table v-else-if="messages.length > 0" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="text-align: left; border-bottom: 2px solid #E5E7EB;">
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">From</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Subject</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase;">Date</th>
            <th style="padding: 0.75rem; font-size: 0.875rem; color: #6B7280; text-transform: uppercase; text-align: center;">Status</th>
            <th style="padding: 0.75rem; text-align: right;"></th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="message in messages" 
            :key="message.id"
            :style="{ 
              borderBottom: '1px solid #F3F4F6',
              background: !message.isRead ? '#F9FAFB' : 'white'
            }"
          >
            <td style="padding: 1rem 0.75rem;">
              <div :style="{ fontWeight: !message.isRead ? '600' : '500' }">{{ message.senderName }}</div>
              <div style="font-size: 0.75rem; color: #6B7280;">{{ message.senderEmail }}</div>
            </td>
            <td style="padding: 1rem 0.75rem;">
              <div :style="{ fontWeight: !message.isRead ? '600' : '400' }">{{ message.subject }}</div>
              <div style="font-size: 0.875rem; color: #6B7280; margin-top: 0.25rem;">
                {{ message.body?.substring(0, 60) }}{{ message.body?.length > 60 ? '...' : '' }}
              </div>
            </td>
            <td style="padding: 1rem 0.75rem;">{{ new Date(message.createdAt).toLocaleDateString() }}</td>
            <td style="padding: 1rem 0.75rem; text-align: center;">
              <span v-if="!message.isRead" style="display: inline-block; width: 8px; height: 8px; background: #2563EB; border-radius: 50%;"></span>
            </td>
            <td style="padding: 1rem 0.75rem; text-align: right;">
              <router-link 
                :to="`/admin/messages/${message.id}`"
                style="color: #2563EB; text-decoration: none; font-size: 0.875rem;"
              >
                Read
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else style="color: #6B7280; text-align: center; padding: 2rem;">No messages found.</p>

      <div v-if="unreadCount > 0" style="margin-top: 1rem; padding: 1rem; background: #EFF6FF; border-radius: 4px; color: #1E40AF;">
        You have {{ unreadCount }} unread message{{ unreadCount !== 1 ? 's' : '' }}
      </div>
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
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #2563EB;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
