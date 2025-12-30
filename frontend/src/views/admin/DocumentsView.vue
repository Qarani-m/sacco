<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const documents = ref([])
const loading = ref(true)

const fetchDocs = async () => {
    // Mocking
    documents.value = [
        { id: 1, type: 'ID Card', status: 'pending', user: 'John Doe' },
        { id: 2, type: 'KRA Pin', status: 'verified', user: 'Jane Smith' }
    ]
    loading.value = false
}

onMounted(() => fetchDocs())
</script>

<template>
  <DashboardLayout>
     <div class="page-header">
      <div class="accent-line"></div>
      <h1 class="page-title">Document Verification</h1>
    </div>

    <div class="grid gap-4">
        <div v-for="doc in documents" :key="doc.id" class="card flex justify-between items-center">
             <div>
                 <h3 class="font-bold">{{ doc.type }}</h3>
                 <p class="text-sm text-gray-500">Submitted by {{ doc.user }}</p>
             </div>
             <div class="flex items-center gap-4">
                 <span class="px-2 py-1 text-xs uppercase bg-gray-100 rounded">{{ doc.status }}</span>
                 <button class="btn-small-outline">Review</button>
             </div>
        </div>
    </div>
  </DashboardLayout>
</template>
