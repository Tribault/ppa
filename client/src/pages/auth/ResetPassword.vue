<template>
  <div class="reset-password">
    <h2>Réinitialiser le mot de passe</h2>
    <form @submit.prevent="submit">
      <input
        v-model="password"
        type="password"
        placeholder="Nouveau mot de passe"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? "Envoi en cours..." : "Réinitialiser le mot de passe" }}
      </button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const loading = ref(false)
const message = ref('')

async function submit() {
  loading.value = true
  message.value = ''
  try {
    message.value = await auth.resetPassword(route.query.token as string, password.value)
    router.push('/login')
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Error resetting password'
  }
   loading.value = false
}

</script>

<style scoped>
.reset-password {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
input {
  display: block;
  margin-bottom: 1rem;
  width: 100%;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
