<script setup>
import { ref } from 'vue'
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-brand">
        <h1>SACCO</h1>
        <p>Member Portal</p>
      </div>
      
      <slot></slot>
      
      <div class="auth-footer">
        <p>&copy; {{ new Date().getFullYear() }} SACCO System. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-brand {
  text-align: center;
  margin-bottom: 3rem;
}

.auth-brand h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.auth-brand p {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-footer {
  text-align: center;
  margin-top: 3rem;
}

.auth-footer p {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin: 0;
}
</style>
