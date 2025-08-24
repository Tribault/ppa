<template>
  <div class="forgot-password">
    <h2>Mot de passe oublié ?</h2>
    <form @submit.prevent="submit">
      <input v-model="email" type="email" placeholder="Entrez votre e-mail" required />
      <button type="submit" class="btn-red-bg" :disabled="loading">
        {{ loading ? 'Envoi en cours...' : 'Envoyer le lien' }}
      </button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const loading = ref(false)
const message = ref('')

async function submit() {
  loading.value = true
  message.value = ''
  try {
    message.value = await authStore.forgotPassword(email.value)
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Error sending reset link'
  }
  loading.value = false
}
</script>

<style scoped lang="scss">
.forgot-password {
  background-color: $red;
  color: white;
  max-width: 400px;
  margin: 2rem auto;
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
