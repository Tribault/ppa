<template>
  <div class="signup">
    <div class="signup-form">
      <h2>{{ $t('auth.signup.title') }}</h2>
      <form v-if="!signupSuccess" @submit.prevent="handleSignup">
        <div>
          <input v-model="email" type="email" :placeholder="$t('auth.signup.emailPlaceholder')" required />
          <input v-model="password" type="password" :placeholder="$t('auth.signup.passwordPlaceholder')" required />
          <input v-model="passwordConfirm" type="password" :placeholder="$t('auth.signup.confirmPlaceholder')" required />
        </div>
        <ul v-if="password" class="password-rules">
          <li :class="{ valid: rules.length }">{{ $t('auth.signup.rules.length') }}</li>
          <li :class="{ valid: rules.upper }">{{ $t('auth.signup.rules.upper') }}</li>
          <li :class="{ valid: rules.lower }">{{ $t('auth.signup.rules.lower') }}</li>
          <li :class="{ valid: rules.number }">{{ $t('auth.signup.rules.number') }}</li>
        </ul>
        <button type="submit" class="btn-red-bg"><b>{{ $t('auth.signup.title') }}</b></button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div v-else class="confirmation">
        <p>{{ $t('auth.signup.success') }}</p>
        <p>{{ $t('auth.signup.checkEmail', { email }) }}</p>
        <p>
          {{ $t('auth.signup.noEmail') }}
          <button class="btn-link" @click="resendEmail">{{ $t('auth.signup.resend') }}</button>
        </p>
      </div>

      <router-link to="/login">
        <p class="signup-link">{{ $t('auth.signup.alreadyRegistered') }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '@/utils/axios'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const password = ref('')
const passwordConfirm = ref('')
const email = ref('')
const error = ref('')
const signupSuccess = ref(false)

const auth = useAuthStore()
const { t } = useI18n()

const rules = computed(() => ({
  length: password.value.length >= 8,
  upper:  /[A-Z]/.test(password.value),
  lower:  /[a-z]/.test(password.value),
  number: /[0-9]/.test(password.value),
}))

const passwordValid = computed(() => Object.values(rules.value).every(Boolean))

const handleSignup = async () => {
  error.value = ''
  if (!passwordValid.value) {
    error.value = t('auth.signup.errorRules')
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = t('auth.signup.errorMatch')
    return
  }
  try {
    await auth.signup(password.value, email.value, "user")
    signupSuccess.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || t('auth.signup.errorGeneric')
  }
}

const resendEmail = async () => {
  try {
    await api.post('/auth/resend-verification', { email: email.value })
    alert(t('auth.signup.resendSuccess'))
  } catch {
    alert(t('auth.signup.resendError'))
  }
}
</script>

<style lang="scss" scoped>
.signup {
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

.signup-form {
  background-color: $red;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}

.signup-link {
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
}

.btn-link {
  background: none;
  border: none;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

.error {
  color: yellow;
}

.password-rules {
  list-style: none;
  padding: 0;
  margin: 0 0.5rem;
  font-size: 0.85rem;

  li::before {
    content: '✗ ';
    color: #ffaaaa;
  }

  li.valid::before {
    content: '✓ ';
    color: #aaffaa;
  }
}
</style>
