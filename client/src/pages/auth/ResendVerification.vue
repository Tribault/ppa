<template>
  <div class="resend-verification">
    <h2>Resend Verification Email</h2>
    <form @submit.prevent="submit">
      <input
        type="email"
        v-model="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit">Resend</button>
    </form>

    <p v-if="message" class="info">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import api from "@/utils/axios" 

const email = ref("")
const message = ref<string | null>(null)

async function submit() {
  try {
    await api.post("/auth/resend-verification", { email: email.value })
    message.value = "✅ If your account exists and is unverified, a new email has been sent."
  } catch (err: any) {
    message.value = err.response?.data?.message || "Something went wrong."
  }
}
</script>

<style scoped>
.resend-verification{
.info {
  margin-top: 1rem;
  color: #555;
}
}
</style>
