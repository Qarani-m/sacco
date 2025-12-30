<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const roles = ref([])
const loading = ref(true)

const fetchRoles = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      roles.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch roles', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Roles & Permissions</h1>
    </div>

    <div class="card">
      <div v-if="loading" style="text-align: center; padding: 2rem;">
        <p>Loading roles...</p>
      </div>

      <div v-else-if="roles.length > 0" class="roles-grid">
        <router-link 
          v-for="role in roles" 
          :key="role.id"
          :to="`/admin/roles/${role.id}`"
          class="role-card"
        >
          <h3>{{ role.name }}</h3>
          <p>{{ role.description }}</p>
          <div class="permissions-count">
            {{ role.permissionsCount || 0 }} permissions
          </div>
        </router-link>
      </div>

      <p v-else style="color: #6B7280; text-align: center; padding: 2rem;">No roles found.</p>
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.role-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #2563EB;
}

.role-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #000;
}

.role-card p {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0 0 1rem 0;
}

.permissions-count {
  font-size: 0.75rem;
  color: #2563EB;
  font-weight: 500;
}
</style>
