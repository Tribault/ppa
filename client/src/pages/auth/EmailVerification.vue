<template>
  <div class="email-verification">
    <h2>Email Verification</h2>
    <p v-if="loading">Verifying your email, please wait...</p>
    <p v-if="success" class="email-verification-success">✅ Your email has been verified! You can now <router-link to="/login">log in</router-link>.</p>
    <p v-if="error" class="email-verification-error">❌ {{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "@/utils/axios"

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.query.token as string
  console.log("token", token)
  if (!token) {
    error.value = "Missing verification token."
    loading.value = false
    return
  }

  try {
    await api.post("/auth/verify-email", { token })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || "Invalid or expired verification link."
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">

.email-verification
{
.success {
  color: green;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
}
</style>
