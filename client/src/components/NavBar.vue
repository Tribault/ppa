<template>
    <nav class="navbar">
        <router-link to="/">Accueil</router-link>
        <template v-if="!auth.user">
            <router-link to="/login">S'indentifier</router-link>
            <router-link to="/signup">S'inscrire</router-link>
        </template>
        <template v-else>
            <span>Bienvenue, {{ auth.user.username }}</span>
            <router-link v-if="auth.user.role === 'admin'" to="/admin">Admin</router-link>
            <button @click="logout">Déconnexion</button>
        </template>
    </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore()
const router = useRouter()

const logout= () =>{
    auth.logout()
    router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #eee;
  align-items: center;
}
a {
  text-decoration: none;
}
button {
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
}
</style>