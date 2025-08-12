<template class="poster-form">
  <Transition name="modal-fade">
    <div v-if="visible" class="modal-overlay">
      <Transition name="modal-popup">
        <div class="modal-box" @click.stop>
          <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="close">
            ✖
          </button>

          <h2 class="text-xl font-bold mb-4">
            {{ posterToEdit?._id ? 'Edit Poster' : 'New Poster' }}
          </h2>

          <form @submit.prevent="submit" class="space-y-3">
            <input v-model="form.title" placeholder="Title" class="input" />
            <input v-model="form.size" placeholder="Size" class="input" />
            <input v-model.number="form.price" type="number" placeholder="Price" class="input" />
            <input
              v-model.number="form.totalStock"
              type="number"
              placeholder="Stock"
              class="input"
            />
            <input v-model="tagsInput" type="text" placeholder="e.g. vintage, sci-fi" />

            <div class="flex justify-between items-center mt-4">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
                💾 Save
              </button>
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
  { immediate: true },
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
      console.log('form', form.value)
      await store.updatePoster(props.posterToEdit._id, form.value)
      toast.success('Poster updated ✅')
    } else {
      await store.createPoster(form.value)
      toast.success('Poster created 🎉')
    }
    emit('saved')
    close()
  } catch (err) {
    toast.error('An error occurred ❌')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-popup-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.modal-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.modal-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
