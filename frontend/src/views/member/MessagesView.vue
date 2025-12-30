<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const inbox = ref([])
const outbox = ref([])
const activeTab = ref('inbox')
const composeMode = ref(false)
const form = ref({ recipientId: '', subject: '', body: '' })
const message = ref('')

const fetchMessages = async () => {
    try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }
        
        const [inRes, outRes] = await Promise.all([
            fetch('/api/messages/inbox', { headers }),
            fetch('/api/messages/outbox', { headers })
        ])
        
        if (inRes.ok) inbox.value = await inRes.json()
        if (outRes.ok) outbox.value = await outRes.json()
    } catch(err) {
        console.error(err)
    }
}

const sendMessage = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
        })
        if (res.ok) {
            message.value = 'Message sent!'
            composeMode.value = false
            fetchMessages()
        }
    } catch(err) {
        message.value = 'Failed to send'
    }
}

onMounted(() => fetchMessages())
</script>

<template>
  <DashboardLayout>
     <div class="page-header flex justify-between items-center">
      <div>
        <div class="accent-line"></div>
        <h1 class="page-title">Messages</h1>
      </div>
      <button @click="composeMode = !composeMode" class="btn-primary" style="width: auto">
          {{ composeMode ? 'Cancel' : 'Compose New' }}
      </button>
    </div>

    <!-- Compose Modal/Area -->
    <div v-if="composeMode" class="card mb-8 border-l-4 border-blue-500">
        <h2 class="section-title mb-4">New Message</h2>
        <form @submit.prevent="sendMessage">
            <div class="form-group">
                <label>Recipient ID (UUID)</label>
                <input type="text" v-model="form.recipientId" placeholder="User ID" required>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" v-model="form.subject" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea v-model="form.body" rows="4" required></textarea>
            </div>
            <button class="btn-primary">Send Message</button>
        </form>
    </div>

    <!-- Tabs -->
    <div class="flex border-b mb-6">
        <button @click="activeTab = 'inbox'" 
                :class="['px-6 py-2 font-medium', activeTab === 'inbox' ? 'border-b-2 border-black' : 'text-gray-500']">
            Inbox
        </button>
        <button @click="activeTab = 'outbox'" 
                :class="['px-6 py-2 font-medium', activeTab === 'outbox' ? 'border-b-2 border-black' : 'text-gray-500']">
            Sent
        </button>
    </div>

    <div class="grid gap-4">
        <div v-for="msg in (activeTab === 'inbox' ? inbox : outbox)" :key="msg.id" class="card p-4">
            <div class="flex justify-between mb-2">
                <h3 class="font-bold">{{ msg.subject }}</h3>
                <span class="text-xs text-gray-500">{{ new Date(msg.sentAt).toLocaleString() }}</span>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ msg.body }}</p>
            <div class="mt-2 text-xs text-gray-400">
                {{ activeTab === 'inbox' ? 'From: ' + (msg.sender ? msg.sender.fullName : 'Unknown') : 'To: ' + (msg.recipient ? msg.recipient.fullName : 'Unknown') }}
            </div>
        </div>
    </div>
  </DashboardLayout>
</template>
