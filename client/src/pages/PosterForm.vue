<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded p-4 w-full max-w-md relative">
      <button class="absolute top-2 right-2" @click="close">✖</button>

      <h2 class="text-xl font-bold mb-4">
        {{ posterToEdit?._id ? 'Edit Poster' : 'New Poster' }}
      </h2>

      <form @submit.prevent="submit">
        <input v-model="form.title" placeholder="Title" class="mb-2 w-full" />
        <input v-model="form.size" placeholder="Size" class="mb-2 w-full" />
        <input v-model.number="form.price" type="number" placeholder="Price" class="mb-2 w-full" />
        <input
          v-model.number="form.totalStock"
          type="number"
          placeholder="Stock"
          class="mb-2 w-full"
        />

        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'

const props = defineProps<{
  visible: boolean
  posterToEdit: Poster | null
}>()
const emit = defineEmits(['close', 'saved'])

const form = ref({
  title: '',
  size: '',
  price: 0,
  totalStock: 0,
})

const store = usePosterStore()

watch(
  () => props.posterToEdit,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = { title: '', size: '', price: 0, totalStock: 0 }
    }
  },
  { immediate: true },
)

function close() {
  emit('close')
}

async function submit() {
  if (props.posterToEdit?._id) {
    await store.updatePoster(props.posterToEdit._id, form.value)
  } else {
    await store.createPoster(form.value)
  }
  emit('saved')
  close()
}
</script>
