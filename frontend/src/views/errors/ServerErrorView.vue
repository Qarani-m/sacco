<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
          <h1 class="text-9xl font-black text-red-100">500</h1>
          <p class="text-2xl font-bold text-gray-800 mt-4">Server Error</p>
          <p class="text-gray-500 mt-2 mb-8">Something went wrong on our end.</p>
          <button @click="$router.go(-1)" class="btn-secondary">Go Back</button>
      </div>
  </div>
</template>
