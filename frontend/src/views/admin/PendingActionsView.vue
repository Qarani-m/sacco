<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const router = useRouter()
const pendingActions = ref([])
const loading = ref(true)
const user = JSON.parse(localStorage.getItem('user') || '{}')

const fetchPendingActions = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/pending-actions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      pendingActions.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch pending actions', err)
  } finally {
    loading.value = false
  }
}

const verifyAction = async (actionId, decision) => {
  const comment = decision === 'rejected' ? prompt('Enter comment (optional):') : null
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/pending-actions/${actionId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ decision, comment })
    })
    
    if (response.ok) {
      alert(`Action ${decision}`)
      await fetchPendingActions()
    }
  } catch (err) {
    console.error('Failed to verify action', err)
    alert('Failed to verify action')
  }
}

const getDetailUrl = (action) => {
  if (action.entityType === 'loan' && action.entityId) {
    return `/admin/loans/${action.entityId}`
  } else if (action.entityType === 'user' && action.entityId) {
    return `/admin/members/${action.entityId}`
  } else if (action.entityType === 'document' && action.entityId) {
    return `/admin/documents/${action.entityId}`
  }
  return '#'
}

const hasUserVerified = (action) => {
  return action.verifications?.some(v => v.verifierId === user.id)
}

const isInitiator = (action) => {
  return action.initiatedBy === user.id
}

onMounted(() => {
  fetchPendingActions()
})
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Pending Admin Actions (Requires 2/3 Approval)</h1>
    </div>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <p>Loading pending actions...</p>
    </div>

    <div v-else-if="pendingActions.length === 0" class="alert-info">
      No pending actions.
    </div>

    <div v-else class="actions-grid">
      <div 
        v-for="action in pendingActions" 
        :key="action.id"
        class="action-card"
      >
        <div class="action-header">
          <h3>{{ action.actionType?.toUpperCase() }} – {{ action.entityType }}</h3>
          <span class="badge-pending">Pending</span>
        </div>

        <div class="action-body">
          <p><strong>Initiated by:</strong> {{ action.initiatorName }}</p>
          <p><strong>Reason:</strong> {{ action.reason }}</p>
          <p><strong>Date:</strong> {{ new Date(action.createdAt).toLocaleString() }}</p>

          <div class="verifications">
            <h4>Verifications ({{ action.verifications?.length || 0 }}/3):</h4>
            <div 
              v-for="v in action.verifications" 
              :key="v.id"
              class="verification-item"
            >
              <div class="verification-header">
                <span>{{ v.verifierName }}</span>
                <span 
                  class="badge"
                  :style="{ 
                    background: v.decision === 'approved' ? '#10B981' : '#EF4444',
                    color: 'white'
                  }"
                >
                  {{ v.decision }}
                </span>
              </div>
              <p v-if="v.comment" class="comment">{{ v.comment }}</p>
            </div>
          </div>

          <div v-if="!isInitiator(action) && !hasUserVerified(action)" class="action-buttons">
            <button @click="verifyAction(action.id, 'approved')" class="btn-approve">
              Approve
            </button>
            <button @click="verifyAction(action.id, 'rejected')" class="btn-reject">
              Reject
            </button>
          </div>

          <p v-else-if="hasUserVerified(action)" class="info-text">
            ✓ You have already verified this action.
          </p>

          <p v-else class="info-text">
            ℹ️ You initiated this action.
          </p>

          <router-link :to="getDetailUrl(action)" class="view-link">
            View Details →
          </router-link>
        </div>
      </div>
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

.alert-info {
  background: #EFF6FF;
  border-left: 4px solid #3B82F6;
  padding: 1rem 1.25rem;
  border-radius: 6px;
  color: #1E40AF;
}

.actions-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E7EB;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.action-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.badge-pending {
  background: #FEF3C7;
  color: #B45309;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-body {
  color: #374151;
  font-size: 0.95rem;
}

.action-body p {
  margin: 0.5rem 0;
}

.verifications {
  margin-top: 1rem;
}

.verifications h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.verification-item {
  padding: 0.75rem 1rem;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #E5E7EB;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.verification-header span:first-child {
  font-weight: 500;
}

.badge {
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.comment {
  font-size: 0.8rem;
  color: #6B7280;
  margin-top: 6px;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-approve, .btn-reject {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  color: white;
}

.btn-approve {
  background: #10B981;
}

.btn-reject {
  background: #EF4444;
}

.info-text {
  color: #6B7280;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.view-link {
  display: inline-block;
  margin-top: 1rem;
  color: #2563EB;
  text-decoration: none;
  font-size: 0.875rem;
}
</style>
