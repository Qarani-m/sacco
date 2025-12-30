<script setup>
import { useRouter } from 'vue-router'

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
    <div class="container-xl flex justify-between items-center">
      <div class="brand">
        <router-link to="/dashboard" class="logo">SACCO</router-link>
      </div>

      <div class="nav-links flex items-center gap-6">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/loans" class="nav-link">Loans</router-link>
        <router-link to="/shares" class="nav-link">Shares</router-link>
        
        <div class="user-menu flex items-center gap-4">
          <span class="text-sm font-medium">{{ user.fullName }}</span>
          <button @click="logout" class="btn-small-outline" style="padding: 0.5rem 1rem;">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  text-decoration: none;
  letter-spacing: -0.025em;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #000000;
}

.gap-6 { gap: 1.5rem; }
.gap-4 { gap: 1rem; }
</style>
