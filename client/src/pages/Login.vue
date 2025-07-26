<template>
    <div class="login">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <input v-model="username" type="text" placeholder="Identifiant" required />
            <input v-model="password" type="password" placeholder="Mot de passe" required />
            <button type="submit">Login</button>
            <p v-if="error" class="error">{{ error }}</p>
        </form>
        <router-link to="/signup">Pas de compte ? Vous pouvez en créer un ici.</router-link>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
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
    }catch(err){
        error.value = 'Identifiant ou mot de passe invalide'
    }
}

</script>

<style scoped>
.error{
    color:red
}
</style>