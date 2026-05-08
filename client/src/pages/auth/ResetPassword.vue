<template>
  <div class="reset-password">
    <div class="reset-password-form">
      <h2>{{ $t('auth.resetPassword.title') }}</h2>
      <form @submit.prevent="submit">
        <input v-model="password" type="password" :placeholder="$t('auth.resetPassword.passwordPlaceholder')" required />
        <button type="submit" class="btn-red-bg" :disabled="loading">
          {{ loading ? $t('auth.resetPassword.sending') : $t('auth.resetPassword.submit') }}
        </button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
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

<style scoped lang="scss">
.reset-password {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;

  form > * {
    margin: 0.5rem;
  }
}

.reset-password-form {
  background-color: $red;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}
</style>
