<template>
    <div class="card">
        <img :src="`http://localhost:5000/uploads/${poster.image}`" alt=""/>
        <h3>{{ poster.title }}</h3>
        <p>{{ poster.description }}</p>
        <button v-if="!poster.isBooked && canBook" @click="bookPoster">Réserver</button>
        <p v-else-if="poster.isBooked">Réservé</p>
    </div>
</template>
<script setup lang="ts">
import axios from 'axios'
import type {Poster} from '../types/models'
import {useAuthStore} from '../stores/auth'

const props = defineProps<{poster: Poster}>()
const auth = useAuthStore()

const canBook = auth.user && auth.user.role == 'user'

const bookPoster = async () => 
{
    await axios.post(`http://localhost:5000/api/posters/${props.poster._id}/book`, null, {
    headers: { Authorization: `Bearer ${auth.token}` }
    })
    window.location.reload()

}
</script>