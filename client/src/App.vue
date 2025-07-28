<template>
  <NavBar />
  <router-view />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import {onMounted} from 'vue'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()

onMounted(() => {
  if (auth.token && !auth.user) {
    auth.fetchUser(); // safe to call here
  }
});

</script>

<style scoped></style>
