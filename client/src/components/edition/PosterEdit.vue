<template class="poster-edit">
  <Transition name="poster-edit-fade">
    <div v-if="visible" class="poster-edit-overlay">
      <Transition name="poster-edit-popup">
        <div class="poster-edit-box" @click.stop>
          <button class="poster-edit-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

          <h2 class="poster-edit-title">
            {{ posterToEdit?._id ? `Modification d'affiche` : `Création d'affiche` }}
          </h2>

          <form @submit.prevent="submit" class="poster-edit-form">
            <div class="poster-edit-form--row">
              <div v-if="form.image" class="poster-edit-preview">
                <img :src="previewUrl" alt="Poster preview" />
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>Titre</b>
              <input
                v-model="form.title"
                title="title"
                placeholder="Title"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>Taille</b>
              <input type="radio" id="sizeL" value="120*160 cm" v-model="form.size" />
              <label for="sizeL">120x160 cm</label>

              <input type="radio" id="sizeM" value="60*80 cm" v-model="form.size" />
              <label for="sizeM">60x80 cm</label>
            </div>
            <div class="poster-edit-form--row">
              <b>Prix</b
              ><input
                v-model.number="form.price"
                type="number"
                placeholder="Price"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>Stock</b
              ><input
                v-model.number="form.totalStock"
                type="number"
                placeholder="Stock"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>Commentaire</b
              ><input
                v-model="form.note"
                type="text"
                placeholder="Commentaire"
                class="poster-edit-input"
              />
            </div>
            <div class="poster-edit-form--row">
              <b>Etiquettes</b>
              <div class="tags">
                <label v-for="tag in tagStore.tags" :key="tag._id">
                  <input type="checkbox" :value="tag._id" v-model="form.tags" />
                  {{ tag.name }}
                </label>
              </div>
            </div>

            <div class="poster-edit-form--actions">
              <button type="submit" class="btn-red-bg">
                <b>Sauvegarder</b> <folder-arrow-down-icon />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Poster } from '@/types/models'
import { XMarkIcon, FolderArrowDownIcon } from '@heroicons/vue/24/solid'
import { usePosterStore } from '@/stores/posters'
import { useTagStore } from '@/stores/tags'
import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  visible: boolean
  posterToEdit: Poster | null
}>()
const emit = defineEmits(['close', 'saved'])

const store = usePosterStore()
const tagStore = useTagStore()

const form = ref<{
  title: string
  size: string
  price: number
  note: string
  totalStock: number
  tags: string[]
  image: File | string | null
}>({
  title: '',
  size: '120*160 cm',
  price: 0,
  note: '',
  totalStock: 0,
  tags: [],
  image: null,
})

const previewUrl = ref<string>('')

onMounted(async () => {
  await tagStore.fetchTags()
})

watch(
  () => props.posterToEdit,
  (val) => {
    if (val) {
      form.value = {
        ...val,
        tags: (val.tags ?? []).map((t) => t._id),
        image: val.image || null,
      }
      previewUrl.value = val.image ? import.meta.env.VITE_IMG_URL + val.image : ''
    } else {
      form.value = { title: '', size: '', price: 0, totalStock: 0, note: '', tags: [], image: null }
      previewUrl.value = ''
    }
  },
  { immediate: true },
)

function close() {
  emit('close')
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    form.value.image = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

async function submit() {
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('size', form.value.size)
    formData.append('price', form.value.price.toString())
    formData.append('note', form.value.note)
    formData.append('totalStock', form.value.totalStock.toString())
    form.value.tags.forEach((tag) => formData.append('tags[]', tag))

    if (form.value.image instanceof File) {
      formData.append('image', form.value.image)
    }

    if (props.posterToEdit?._id) {
      await store.updatePoster(props.posterToEdit._id, formData)
      toast.success('Poster updated ✅')
    } else {
      await store.createPoster(formData)
      toast.success('Poster created 🎉')
    }

    emit('saved')
    close()
  } catch (err) {
    console.error(err)
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

.poster-edit-preview {
  margin-top: 8px;

  img {
    max-width: 120px;
    max-height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
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

  &--row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;

    &:first-of-type {
      input {
        border: unset;
      }
    }
  }

  &--actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    button > b {
      margin-right: 8px;
    }
  }
}

.poster-edit-input {
  padding: 8px 10px;
  margin-left: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex-grow: 1;
  max-width: 90%;
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
