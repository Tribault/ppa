<template>
<NavBar />
  <router-view/>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth';
const auth = useAuthStore();
auth.fetchUserIfNeeded();
</script>

<style scoped>
</style>
