<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const requests = ref([])
const loading = ref(true)
const message = ref('')

const fetchRequests = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/guarantors/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
        requests.value = await res.json()
    }
  } catch (err) {
      console.error(err)
  } finally {
      loading.value = false
  }
}

const respond = async (requestId, status) => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/guarantors/respond/${requestId}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
        if (res.ok) {
            message.value = `Request ${status} successfully`
            fetchRequests()
        }
    } catch (err) {
        message.value = 'Action failed'
    }
}

onMounted(() => fetchRequests())
</script>

<template>
  <DashboardLayout>
     <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Guarantor Requests</h1>
    </div>

    <div v-if="message" class="alert alert-info mb-6">{{ message }}</div>

    <div class="grid gap-6">
        <div v-for="req in requests" :key="req.id" class="card">
             <div class="flex justify-between items-center">
                 <div>
                     <h3 class="font-bold">Loan Request from Member #{{ req.loan.borrower.id.substring(0,8) }}</h3>
                     <p class="text-sm text-gray-500">Pledge required: {{ req.sharesPledged }} shares</p>
                 </div>
                 <div class="flex gap-2">
                     <button @click="respond(req.id, 'rejected')" class="btn-small-outline border-red-500 text-red-500">Decline</button>
                     <button @click="respond(req.id, 'accepted')" class="btn-small bg-green-600 border-green-600">Approve Pledge</button>
                 </div>
             </div>
        </div>
        
        <div v-if="requests.length === 0 && !loading" class="text-center text-gray-500 py-12 card">
            No pending requests.
        </div>
    </div>
  </DashboardLayout>
</template>
