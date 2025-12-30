<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const route = useRoute()
const role = ref(null)
const loading = ref(true)

const fetchRole = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/roles/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      role.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch role', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRole()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Role Details</h1>
      <router-link to="/admin/roles" class="btn-secondary">← Back to Roles</router-link>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading role...</p>
    </div>

    <div v-else-if="role" class="card">
      <h2 class="section-title">{{ role.name }}</h2>
      <p class="description">{{ role.description }}</p>

      <h3 class="permissions-title">Permissions</h3>
      <div v-if="role.permissions && role.permissions.length > 0" class="permissions-list">
        <div 
          v-for="permission in role.permissions" 
          :key="permission.id"
          class="permission-item"
        >
          <span class="permission-name">{{ permission.name }}</span>
          <span class="permission-description">{{ permission.description }}</span>
        </div>
      </div>
      <p v-else style="color: #6B7280;">No permissions assigned to this role.</p>
    </div>

    <div v-else class="card">
      <p>Role not found.</p>
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
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #000;
}

.description {
  color: #6B7280;
  margin: 0 0 2rem 0;
}

.permissions-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: #000;
}

.permissions-list {
  display: grid;
  gap: 0.75rem;
}

.permission-item {
  padding: 1rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.permission-name {
  font-weight: 500;
  color: #000;
}

.permission-description {
  font-size: 0.875rem;
  color: #6B7280;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  display: inline-block;
  background: #6B7280;
  color: white;
}
</style>
