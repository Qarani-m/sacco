<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const members = ref([])
const loading = ref(true)

const fetchMembers = async () => {
    // Mocking for now, would be /api/admin/members
    members.value = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com', status: 'active', joinedDate: '2024-01-01' },
        { id: '2', fullName: 'Jane Smith', email: 'jane@example.com', status: 'pending', joinedDate: '2024-02-15' },
    ]
    loading.value = false
}

onMounted(() => fetchMembers())
</script>

<template>
  <DashboardLayout>
    <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Member Management</h1>
    </div>

    <div class="card">
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="m in members" :key="m.id">
                    <td>{{ m.fullName }}</td>
                    <td>{{ m.email }}</td>
                    <td>
                        <span class="px-2 py-1 text-xs rounded-full" 
                              :class="m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                            {{ m.status }}
                        </span>
                    </td>
                    <td>{{ m.joinedDate }}</td>
                    <td>
                        <button class="text-blue-600 hover:underline mr-2">View</button>
                        <button class="text-red-600 hover:underline">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </DashboardLayout>
</template>
