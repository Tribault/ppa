<template>
  <div class="login">
    <div class="login-form">
          <h2>Connexion</h2>
    <form @submit.prevent="handleLogin">
      <div><b>Identifiant :</b> <input v-model="username" type="text" placeholder="Identifiant" required /></div>
      <div><b>Mot de passe :</b> <input v-model="password" type="password" placeholder="Mot de passe" required /></div>
      <button type="submit" class="btn-red-bg"><b>Se connecter</b></button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <router-link to="/signup">
      <p class="signup">Créer un compte</p></router-link>
    <p class="forgot-password">
      <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
    </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const error = ref('')

const auth = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = 'Identifiant ou mot de passe invalide'
  }
}
</script>

<style scoped lang="scss">
.error {
  color: red;
}

.login{
  display:flex;
  flex-direction: column;
  color: $red;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
  


  form > *{
    margin: 0.5rem;
    
  }
}

.login-form{
 background-color: $red;
  padding:1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}

.signup, .forgot-password{
  font-weight: 700;
  &:hover{
    text-decoration: underline;
  }
}
</style>
