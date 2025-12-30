<script setup>
import { computed } from 'vue'
import AdminHeader from './AdminHeader.vue'
import MemberHeader from './MemberHeader.vue'
import Footer from './Footer.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'member', // 'member' or 'admin'
    validator: (value) => ['member', 'admin'].includes(value)
  },
  pendingCount: {
    type: Number,
    default: 0
  }
})

const HeaderComponent = computed(() => {
  return props.variant === 'admin' ? AdminHeader : MemberHeader
})
</script>

<template>
  <div class="layout">
    <component :is="HeaderComponent" :pending-count="pendingCount" />
    
    <main class="container-2xl">
      <slot></slot>
    </main>
    
    <Footer />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 2rem;
}

.container-2xl {
  max-width: 1536px;
  margin: 0 auto;
  width: 100%;
}
</style>
