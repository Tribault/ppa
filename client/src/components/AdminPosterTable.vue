<template>
<div class="table-container">
  <table class="sticky-table" aria-label="Posters inventory">
    <thead>
      <tr>
        <th class="sticky-col">Titre</th>
        <th>Taille</th>
        <th>Prix</th>
        <th>Stock</th>
        <th>Etiquettes</th>
        <th>Commentaire</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="p in posters">
        <th scope="row" class="sticky-col">{{p.title}}</th>
        <td>{{ p.size }}</td>
        <td>{{p.price}}€</td>
        <td>{{p.totalStock}}</td>
        <td>{{ p.tags.map(t => t.name).join(', ') }}</td>
        <td>{{p.note}}</td>
        <td>
          <eye-icon v-if="p.image" class="icon" @click="viewImage(p.image)"/> 
          <pencil-icon class="icon" /> 
          <trash-icon class="icon" /></td>
      </tr>
    </tbody>
  </table>
</div>
</template>
<script setup lang="ts">
import type { Poster } from '@/types/models'
import {
  EyeIcon,
  PencilIcon,
TrashIcon
} from '@heroicons/vue/24/solid'

const props = defineProps<{
  posters: Poster[]
}>()

function viewImage(image: string) {
    window.open(import.meta.env.VITE_IMG_URL + image,'_blank')
}


</script>
<style lang="scss" scoped>


</style>