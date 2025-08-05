<template>
  <div class="signup">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignup">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <select v-model="role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">S'inscrire</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/login">Déjà inscrit ? Identifiez-vous</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const email = ref('')
const role = ref<'user' | 'admin'>('user')
const error = ref('')

const auth = useAuthStore()
const router = useRouter()

const handleSignup = async () => {
  error.value = ''
  try {
    await auth.signup(username.value, password.value, email.value, role.value)
    router.push('/')
  } catch (err) {
    error.value = 'Identifiant déjà pris.'
  }
}
</script>

<style scoped>
.error {
  color: red;
}
</style>
