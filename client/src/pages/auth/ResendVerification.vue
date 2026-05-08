<template>
  <div class="resend-verification">
    <div class="resend-verification-form">
     <h2>{{ $t('auth.resendVerification.title') }}</h2>
    <b>{{ $t('auth.resendVerification.action') }}</b>
    <form @submit.prevent="submit">
      <input
        type="email"
        v-model="email"
        :placeholder="$t('auth.resendVerification.emailPlaceholder')"
        required
      />
      <button type="submit" class="btn-red-bg">{{ $t('auth.resendVerification.submit') }}</button>
    </form>
    </div>

    <p v-if="message" class="info">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import api from "@/utils/axios"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref("")
const message = ref<string | null>(null)

async function submit() {
  try {
    await api.post("/auth/resend-verification", { email: email.value })
    message.value = t('auth.resendVerification.success')
  } catch (err: any) {
    message.value = err.response?.data?.message || t('auth.resendVerification.error')
  }
}
</script>

<style lang="scss" scoped>
.resend-verification{
  display: flex;
  flex-direction: column;
  color: $red;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;

  form > * {
    margin: 0.5rem;
  }
.info {
  margin-top: 1rem;
  color: #555;
}
.resend-verification-form{
  background-color: $red;
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}
}
</style>
