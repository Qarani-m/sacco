<script setup>
import DashboardLayout from "@/components/layout/DashboardLayout.vue"
</script>

<template>
  <DashboardLayout variant="admin">
    <div class="page-header">
      <h1 class="page-title">Customer Service Dashboard</h1>
      <p class="page-subtitle">Member support and service management</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Open Tickets</div>
        <div class="stat-value">0</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Pending Messages</div>
        <div class="stat-value">0</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/admin/messages" class="action-card">
          <div class="action-title">Messages</div>
          <div class="action-description">View member messages</div>
        </router-link>

        <router-link to="/admin/members" class="action-card">
          <div class="action-title">Members</div>
          <div class="action-description">View all members</div>
        </router-link>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.page-header {
  border-bottom: 2px solid #000;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.page-subtitle {
  color: #6B7280;
  margin: 0.5rem 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  display: block;
  padding: 1.5rem;
  border: 2px solid #000;
  background: white;
  text-decoration: none;
  color: #000;
  transition: all 0.2s;
}

.action-card:hover {
  background: #000;
  color: white;
}

.action-title {
  font-weight: 600;
}

.action-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.action-card:hover .action-description {
  color: #D1D5DB;
}
</style>
