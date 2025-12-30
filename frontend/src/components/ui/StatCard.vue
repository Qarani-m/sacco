<script setup>
defineProps({
  label: String,
  value: [String, Number],
  subtext: String,
  meta: String,
  color: {
    type: String,
    default: 'black' 
  }
})
</script>

<template>
  <div class="stat-card">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-value" :style="{ color: color }">{{ value }}</p>
    <p v-if="subtext" class="text-secondary" style="font-size: 0.875rem; margin-top: 0.5rem;">
      {{ subtext }}
    </p>
    <p v-if="meta" class="text-meta" style="margin-top: 0.5rem;">{{ meta }}</p>
    <slot name="actions"></slot>
  </div>
</template>

<style scoped>
/* Inherits from global design-system.css, but ensure encapsulation if needed */
</style>
