<template>
  <nav class="navbar">
    <div class="navbar-home">
      <router-link class="navbar-home__link" to="/"><img src="@/assets/logo.png" /></router-link>
    </div>
    <div v-if="!auth.user" class="navbar-options">
      <router-link to="/login">Identification / Inscription</router-link>
    </div>
    <div v-else class="navbar-options">
      <router-link v-if="auth.user.role === 'admin' && $route.path !== '/admin'" to="/admin"
        >Admin</router-link
      >
      <router-link v-if="auth.user.role === 'user'" to="/account">Mes réservations</router-link>
      <div class="navbar-options__user">
        <span class="navbar-home__logout--user">{{ auth.user.email }}</span>
        <button @click="logout" class="navbar-home__logout" title="se déconnecter">
          [Déconnexion]
        </button>
      </div>
    </div>
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
  color: whitesmoke;
  font: $font-size-lg $font-base;
  font-weight: 700;
  gap: 1rem;
  padding: 1rem;
  background-color: $red;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
}

.navbar-home__link > img {
  max-height: 120px;
}
.navbar-home__logout {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

.navbar-home__logout--user {
  font-weight: 700;
}

.navbar-options__user {
  display: flex;
  flex-direction: column;
  justify-self: flex-end;
}

.navbar-options {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  word-break: break-all;
}

@media screen and (max-width: $break-sm) {
  .navbar-home {
    flex-grow: 1;
    text-align: center;
  }
  .navbar {
    flex-wrap: wrap;
    font-size: 1rem;
  }
}
</style>
