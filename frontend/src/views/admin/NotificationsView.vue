<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const notifications = ref([])

const fetchNotifications = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) notifications.value = await res.json()
}

onMounted(() => fetchNotifications())
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Notifications</h1>
    </div>

    <div class="grid gap-4">
        <div v-for="n in notifications" :key="n.id" class="card border-l-4" 
             :class="{'border-blue-500': n.type==='info', 'border-red-500': n.type==='error'}">
            <h3 class="font-bold">{{ n.title }}</h3>
            <p>{{ n.message }}</p>
            <p class="text-xs text-gray-400 mt-2">{{ new Date(n.createdAt).toLocaleString() }}</p>
        </div>
        <div v-if="notifications.length === 0" class="text-center py-12 text-gray-500">
            No notifications.
        </div>
    </div>
  </DashboardLayout>
</template>
