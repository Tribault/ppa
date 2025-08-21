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
          <pencil-icon class="icon" @click="$emit('edit', p)"/> 
          <trash-icon class="icon" @click="deleteConfirmation(p)"/></td>
      </tr>
    </tbody>
  </table>
</div>
<confirm-modal message="Supprimer cette affiche.":visible="showDeleteModal" @cancel="showDeleteModal=false" @confirm="$emit('delete', posterToDelete)"/>
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import {ref} from 'vue'
import {
  EyeIcon,
  PencilIcon,
TrashIcon
} from '@heroicons/vue/24/solid'

const props = defineProps<{
  posters: Poster[]
}>()

const emit = defineEmits(['edit', 'delete'])

const showDeleteModal = ref(false)
const posterToDelete = ref<Poster | null>(null)

function viewImage(image: string) {
    window.open(import.meta.env.VITE_IMG_URL + image,'_blank')
}

function deleteConfirmation(poster: Poster){
  showDeleteModal.value = true;
  posterToDelete.value = poster
}
</script>
<style lang="scss" scoped>


</style>