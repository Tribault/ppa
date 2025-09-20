<template>
  <div class="signup">
    <div class="signup-form">
      <h2>Créer un compte</h2>
      <form v-if="!signupSuccess" @submit.prevent="handleSignup">
        <div>
          <input v-model="username" type="text" placeholder="Username" required />
          <input v-model="email" type="email" placeholder="Adresse e-mail" required />
          <input v-model="password" type="password" placeholder="Mot de passe" required />
        </div>
        <button type="submit" class="btn-red-bg"><b>Créer un compte</b></button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div v-else class="confirmation">
        <p>✅ Votre compte a été créé.</p>
        <p>
          Veuillez vérifier votre boîte mail (<b>{{ email }}</b>) et cliquer sur le lien
          de confirmation pour activer votre compte.
        </p>
        <p>
          Pas reçu d’email ?
          <button class="btn-link" @click="resendEmail">Renvoyer le mail de vérification</button>
        </p>
      </div>

      <router-link to="/login">
        <p class="signup-link">Déjà inscrit ? Identifiez-vous</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/utils/axios' // your axios instance
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const email = ref('')
const error = ref('')
const signupSuccess = ref(false)

const auth = useAuthStore()

const handleSignup = async () => {
  error.value = ''
  try {
    await auth.signup(username.value, password.value, email.value, "user")
    signupSuccess.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue.'
  }
}

const resendEmail = async () => {
  try {
    await api.post('/auth/resend-verification', { email: email.value })
    alert('Un nouvel email de vérification a été envoyé.')
  } catch {
    alert('Impossible de renvoyer l’email de vérification.')
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
</style>
