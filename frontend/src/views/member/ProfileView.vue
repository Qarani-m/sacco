<script setup>
import { ref } from 'vue'
import DashboardLayout from "@/components/layout/DashboardLayout.vue"

const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>

<template>
  <DashboardLayout>
      <div class="page-header">
          <div class="accent-line"></div>
          <h1 class="page-title">My Profile</h1>
      </div>

      <div class="card max-w-2xl">
          <div class="flex items-center gap-6 mb-8 border-b pb-8">
              <div class="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold">
                  {{ user.fullName ? user.fullName.charAt(0) : 'U' }}
              </div>
              <div>
                  <h2 class="text-xl font-bold">{{ user.fullName }}</h2>
                  <p class="text-gray-500">{{ user.email }}</p>
                  <span class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full uppercase">
                      {{ user.role || 'Member' }}
                  </span>
              </div>
          </div>
          
          <form class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                  <div>
                      <label class="block text-sm font-medium mb-1">Phone Number</label>
                      <input type="text" :value="user.phoneNumber" disabled class="input-field bg-gray-50">
                  </div>
                  <div>
                      <label class="block text-sm font-medium mb-1">Member ID</label>
                      <input type="text" :value="user.id" disabled class="input-field bg-gray-50">
                  </div>
              </div>
          </form>
      </div>
  </DashboardLayout>
</template>
