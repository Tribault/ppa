<template>
  <div class="login">
    <div class="login-form">
      <h2>{{ $t('auth.login.title') }}</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <input v-model="email" type="text" :placeholder="$t('auth.login.emailPlaceholder')" required />
          <input v-model="password" type="password" :placeholder="$t('auth.login.passwordPlaceholder')" required />
        </div>
        <button type="submit" class="btn-red-bg"><b>{{ $t('auth.login.submit') }}</b></button>
        <p v-if="error">{{ error }}</p>
      </form>
      <router-link to="/signup"><p class="signup">{{ $t('auth.login.signup') }}</p></router-link>
      <p class="forgot-password">
        <RouterLink to="/forgot-password">{{ $t('auth.login.forgotPassword') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const email = ref('')
const password = ref('')
const error = ref('')

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const handleLogin = async () => {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err : any) {
    const message = err.response?.data?.message || t('auth.login.errorFailed')
    if (message == "Not verified.") {
      toast.error(t('auth.login.errorNotVerified'))
      router.push('/resend-verification')
    } else {
      toast.error(message)
    }
  }
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  color: $red;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;

  form > * {
    margin: 0.5rem;
  }
}

.login-form {
  background-color: $red;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}

.signup,
.forgot-password {
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
}
</style>
