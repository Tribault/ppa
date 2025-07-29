<template>
  <NavBar />
  <router-view v-if="!auth.token || auth.user" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (!auth.token && localStorage.getItem('token')) {
    auth.token = localStorage.getItem('token')!
  }
  if (auth.token && !auth.user) {
    auth.fetchUser()
  }
})
</script>

<style scoped></style>
