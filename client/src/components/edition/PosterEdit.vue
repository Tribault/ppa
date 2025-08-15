<template class="poster-edit">
  <Transition name="poster-edit-fade">
    <div v-if="visible" class="poster-edit-overlay">
      <Transition name="poster-edit-popup">
        <div class="poster-edit-box" @click.stop>
          <button class="poster-edit-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

          <h2 class="poster-edit-title">
            {{ posterToEdit?._id ? 'Edit Poster' : 'New Poster' }}
          </h2>

          <form @submit.prevent="submit" class="poster-edit-form">
            <input v-model="form.title" title = "title" placeholder="Title" class="poster-edit-input" />
            <input v-model="form.size" placeholder="Size" class="poster-edit-input" />
            <input v-model.number="form.price" type="number" placeholder="Price" class="poster-edit-input" />
            <input
              v-model.number="form.totalStock"
              type="number"
              placeholder="Stock"
              class="poster-edit-input"
            />
            <input v-model="tagsInput" type="text" placeholder="e.g. vintage, sci-fi" class="poster-edit-input" />

            <div class="poster-edit-form--actions">
              <button type="submit" class="btn-red-bg"> <b>Sauvegarder</b> <folder-arrow-down-icon /></button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Poster } from '@/types/models'
import {XMarkIcon, FolderArrowDownIcon
  
} from '@heroicons/vue/24/solid'
import { usePosterStore } from '@/stores/posters'
import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  visible: boolean
  posterToEdit: Poster | null
}>()
const emit = defineEmits(['close', 'saved'])

const tagsInput = ref('')
const tags = ref<string[]>([])

const form = ref({
  title: '',
  size: '',
  price: 0,
  totalStock: 0,
  tags: tags,
})

const store = usePosterStore()

watch(
  () => props.posterToEdit,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = { title: '', size: '', price: 0, totalStock: 0, tags: tags }
    }
  },
  { immediate: true }
)

watch(tagsInput, (val) => {
  form.value.tags = val
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
})

function close() {
  emit('close')
}

async function submit() {
  try {
    if (props.posterToEdit?._id) {
      await store.updatePoster(props.posterToEdit._id, form.value)
      toast.success('Poster updated ✅')
    } else {
      await store.createPoster(form.value)
      toast.success('Poster created 🎉')
    }
    emit('saved')
    close()
  } catch {
    toast.error('An error occurred ❌')
  }
}
</script>

<style scoped lang="scss">


  .poster-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-edit-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.poster-edit-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
}


.poster-edit-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.poster-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--actions{
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button > b{
   margin-right: 8px;
  }
  }
}

.poster-edit-input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
}


.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
  background-color: #1d4ed8;
}
}

/* Transitions */
.poster-edit-fade-enter-active,
.poster-edit-fade-leave-active {
  transition: opacity 0.25s ease;
}
.poster-edit-fade-enter-from,
.poster-edit-fade-leave-to {
  opacity: 0;
}

.poster-edit-popup-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.poster-edit-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.poster-edit-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
