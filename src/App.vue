<script setup>
import AppLayout from './components/layout/AppLayout.vue'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
</script>
<template>
  <AppLayout v-if="auth.user"><RouterView /></AppLayout>
  <RouterView v-else />
</template>
