<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  pendingCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/auth/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h2>SACCO ADMIN</h2>
    </div>
    <ul class="navbar-menu">
      <li><router-link to="/admin/dashboard">Dashboard</router-link></li>
      <li>
        <router-link to="/admin/pending-actions">
          Pending <span class="badge">{{ pendingCount }}</span>
        </router-link>
      </li>
      <li><router-link to="/admin/members">Members</router-link></li>
      <li><router-link to="/admin/documents">Documents</router-link></li>
      <li><router-link to="/admin/loans">Loans</router-link></li>
      <li><router-link to="/admin/reports">Reports</router-link></li>
      <li><router-link to="/admin/messages">Messages</router-link></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle">{{ user.fullName || user.full_name }}</a>
        <ul class="dropdown-menu">
          <li><router-link to="/notifications">Notifications</router-link></li>
          <li><router-link to="/media/profile">Profile</router-link></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </li>
    </ul>
  </nav>
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
</style>
