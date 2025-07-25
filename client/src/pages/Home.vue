<template>
    <h2>Posters</h2>
    <PosterCard v-for="p in posters" :key="p._id" :poster="p"/>
</template>

<script setup lang="ts">
import axios from 'axios'
import {ref, onMounted} from 'vue'
import type {Poster} from '../types/models'
import PosterCard from '../components/PosterCard.vue'

const posters = ref<Poster[]>([])

onMounted(async() => {
    const res = await axios.get('http://localhost:5000/api/posters')
    posters.value = res.data
})
</script>