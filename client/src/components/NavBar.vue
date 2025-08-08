<template>
  <nav class="navbar">
    <router-link to="/"><img src="@/assets/logo.png"/></router-link>
    <template v-if="!auth.user">
      <router-link to="/login">S'indentifier</router-link>
      <router-link to="/signup">S'inscrire</router-link>
    </template>
    <template v-else>
      
      <router-link v-if="auth.user.role === 'admin'" to="/admin" >Admin</router-link>
      <router-link v-if="auth.user.role === 'user'" to="/account" >Mes réservations</router-link>
      <div>
        <span>{{ auth.user.email }}</span>
        <button @click="logout">Déconnexion</button>
      </div>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  color:whitesmoke;
  font: 1.4rem $font-base;
  gap: 1rem;
  padding: 1rem;
  background-color: $red;
  align-items: center;
  
  text-decoration: none;
  max-height: 200px;
}

img{
  max-width:100%;
  max-height: 180px;
}
</style>
