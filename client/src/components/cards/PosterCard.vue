<template>
  <div v-if="view === 'grid'" class="card-grid">
    <img v-if="poster.image" :src="imgUrl" alt="" />
    <div v-else><EyeSlashIcon /></div>
    <div>
      <h3 class="title-poster">{{ poster.title }}</h3>
      <p>Stock disponible : {{ poster.availableStock }}</p>
      <p v-if="poster.note">{{ poster.note }}</p>
      <span v-if="canBook">
        <p>
          {{ quantity }} affiche
          <button @click="increment" :disabled="quantity >= poster.availableStock">
            <PlusIcon class="icon" />
          </button>
          <button @click="decrement" :disabled="quantity <= 1">
            <MinusIcon class="icon" />
          </button>
        </p>
        <p>Prix total : {{ poster.price * quantity }} €</p>
        <button @click="bookPoster">Réserver</button>
      </span>
      <p v-else>{{ poster.price }} €</p>
    </div>
  </div>
  <tr v-else class="card-list, border-t">
    <td><EyeIcon class="icon"/></td>
    <td v-for="column in columns" :key="column.key" class="px-4 py-2 whitespace-nowrap text-sm">
      {{ renderCell(column) }}
    </td>
    <td v-if="canBook">
      <button @click="increment" :disabled="quantity >= poster.availableStock">
        <PlusIcon class="icon" />
      </button>
      <button @click="decrement" :disabled="quantity <= 1">
        <MinusIcon class="icon" />
      </button>
      <button @click="bookPoster">Réserver</button>
    </td>
    <td v-if="admin && auth.user?.role == 'admin'">
      <span @click="$emit('edit', poster)"><PencilIcon class="icon" /></span>
      <span @click="confirmDelete"><DocumentMinusIcon class="icon" /></span>
    </td>
  </tr>
   <ConfirmModal
  :visible="confirmDeleteVisible"
  message="This will permanently delete the poster."
  @confirm="doDelete"
  @cancel="confirmDeleteVisible = false"
/>
</template>

<script setup lang="ts">

import type { Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import { useBookingStore } from '@/stores/bookings'
import { useAuthStore } from '@/stores/auth'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { computed, ref } from 'vue'
import { EyeSlashIcon, EyeIcon, PlusIcon, MinusIcon, PencilIcon, DocumentMinusIcon} from '@heroicons/vue/24/solid'

import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  poster: Poster
  admin?: boolean
  columns: { key: string; label: string; manual?: boolean }[]
  view: 'grid' | 'list'
}>()

const emit = defineEmits(['edit', 'updated'])

const posterStore = usePosterStore()
const bookingStore = useBookingStore()

const imgUrl = ref<string>(import.meta.env.VITE_IMG_URL + props.poster.image)

const auth = useAuthStore()
const canBook = computed(() => auth.user?.role === 'user')
const quantity = ref<number>(1)

function resolve(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

function renderCell(column: { key: string; manual?: boolean }) {
  if (!column.manual) {
    return resolve(props.poster, column.key)
  }

  switch (column.key) {
    case 'total':
      return props.poster.price * quantity.value + ' €'
    case 'image':
      return '<buttton>'
    default:
      return '—'
  }
}

const bookPoster = async () => {
  try {
    if(auth.user)
    bookingStore.createBooking({
    posterId: props.poster._id,
    userId: auth.user._id,
    quantity: quantity.value,
})
    quantity.value = 1
    toast.success('Booking created!')
    emit('updated')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Booking failed')
  }
}

const increment = () => {
  if (quantity.value < props.poster.availableStock) {
    quantity.value++
  }
}

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const confirmDeleteVisible = ref(false)

function confirmDelete() {
  confirmDeleteVisible.value = true
}

async function doDelete() {
  try {
    if (props.poster?._id) {
      await posterStore.deletePoster(props.poster._id)
      toast.success('Poster deleted 🗑')
    }
  } catch (err) {
    toast.error('Failed to delete ❌')
  } finally {
    confirmDeleteVisible.value = false
  }
}
</script>

<style scoped>
.card-grid {
  width: 200px;
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;

  & img {
    max-width: 150px;
  }
}

.title-poster {
  font-weight: 700;
}

.icon {
  width: 14px;
  height: 14px;
  color: #333;
}

.card-list {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
  justify-content: space-between;
}
</style>
