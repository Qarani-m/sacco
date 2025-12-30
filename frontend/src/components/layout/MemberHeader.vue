<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const unreadNotifications = ref(0)
const unreadMessages = ref(0)
const showNotificationsModal = ref(false)
const notifications = ref([])
const loadingNotifications = ref(false)

const fetchUnreadCounts = async () => {
  try {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }
    
    // Fetch unread counts
    const [notifRes, msgRes] = await Promise.all([
      fetch('/api/notifications/unread-count', { headers }).catch(() => ({ ok: false })),
      fetch('/api/messages/unread-count', { headers }).catch(() => ({ ok: false }))
    ])
    
    if (notifRes.ok) {
      const data = await notifRes.json()
      unreadNotifications.value = data.count || 0
    }
    
    if (msgRes.ok) {
      const data = await msgRes.json()
      unreadMessages.value = data.count || 0
    }
  } catch (err) {
    console.error('Failed to fetch unread counts', err)
  }
}

const openNotificationsModal = async () => {
  showNotificationsModal.value = true
  await loadNotifications()
}

const loadNotifications = async () => {
  loadingNotifications.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      notifications.value = await response.json()
      unreadNotifications.value = notifications.value.filter(n => !n.isRead).length
    }
  } catch (err) {
    console.error('Failed to load notifications', err)
  } finally {
    loadingNotifications.value = false
  }
}

const markAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token')
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    await loadNotifications()
  } catch (err) {
    console.error('Failed to mark notification as read', err)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/auth/login')
}

onMounted(() => {
  fetchUnreadCounts()
  // Refresh counts every 30 seconds
  setInterval(fetchUnreadCounts, 30000)
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h2>SACCO PORTAL</h2>
    </div>
    <ul class="navbar-menu">
      <li><router-link to="/dashboard">Dashboard</router-link></li>
      <li><router-link to="/shares">Shares</router-link></li>
      <li><router-link to="/loans">Loans</router-link></li>
      <li><router-link to="/welfare">Welfare</router-link></li>
      <li><router-link to="/guarantors/requests">Guarantors</router-link></li>
      <li>
        <a href="#" @click.prevent="openNotificationsModal">
          Notifications <span class="badge">{{ unreadNotifications }}</span>
        </a>
      </li>
      <li>
        <router-link to="/messages">
          Messages <span class="badge">{{ unreadMessages }}</span>
        </router-link>
      </li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle">{{ user.fullName || user.full_name }}</a>
        <ul class="dropdown-menu">
          <li><router-link to="/media/profile">Profile</router-link></li>
          <li><router-link to="/savings">Savings</router-link></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </li>
    </ul>
  </nav>

  <!-- Notifications Modal -->
  <div v-if="showNotificationsModal" class="modal-overlay" @click.self="showNotificationsModal = false">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Notifications</h2>
        <button class="modal-close" @click="showNotificationsModal = false">×</button>
      </div>
      <div class="modal-body">
        <div v-if="loadingNotifications" class="empty-state">
          <p>Loading notifications...</p>
        </div>
        <div v-else-if="notifications.length === 0" class="empty-state">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔔</div>
          <p style="margin: 0;">No notifications</p>
        </div>
        <div v-else>
          <div 
            v-for="n in notifications" 
            :key="n.id"
            :class="['notification-item', { unread: !n.isRead }]"
            @click="markAsRead(n.id)"
          >
            <div class="notification-title">{{ n.title }}</div>
            <div class="notification-message">{{ n.message }}</div>
            <div class="notification-time">{{ formatDate(n.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  background: #000000;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E5E5E5;
}

.navbar-brand h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.navbar-menu {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  transition: opacity 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.navbar-menu a:hover {
  opacity: 0.7;
}

.badge {
  background: white;
  color: #000000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 5px;
  font-weight: 600;
}

.dropdown {
  position: relative;
}

.dropdown-toggle::after {
  content: ' ▼';
  font-size: 10px;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 150px;
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
  border: 1px solid #E5E5E5;
  z-index: 100;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-menu a {
  color: #000000;
  display: block;
  padding: 0.75rem 1rem;
  text-transform: none;
  letter-spacing: normal;
}

.dropdown-menu a:hover {
  background: #FAFAFA;
  opacity: 1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #000000;
}

.modal-close {
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6B7280;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #000000;
}

.modal-body {
  padding: 0;
}

.notification-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #E5E5E5;
  cursor: pointer;
  transition: background 0.3s ease;
}

.notification-item:hover {
  background: #FAFAFA;
}

.notification-item.unread {
  border-left: 3px solid #000000;
  background: #FAFAFA;
}

.notification-title {
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.notification-message {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: #9CA3AF;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6B7280;
}
</style>
