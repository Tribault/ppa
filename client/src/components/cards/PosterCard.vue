<template class="poster-card">
  <div v-if="view === 'grid'" class="poster-card-grid">
    <div v-if="poster.image" class="poster-card-poster">
      <img :src="imgUrl" alt="" />
      <div v-if="poster.tags.includes('vintage')" class="poster-card-badge">Collector</div>
    </div>
    <div v-else class="poster-card-poster"><EyeSlashIcon /></div>
    <div class="poster-card-info">
      <div class="poster-card-title">{{ poster.title }}</div>
      <div>{{ poster.price }} €</div>
    </div>
  </div>
  <tr v-else class="card-list, border-t">
    <td><EyeIcon class="icon" /></td>
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
import {
  EyeSlashIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  DocumentMinusIcon,
} from '@heroicons/vue/24/solid'

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
    if (auth.user)
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

<style lang="scss" scoped>
.poster-card-grid {
  width: 300px;
  height: 525px;
  background-color: $red;
  color: white;
  overflow: hidden;
}

.poster-card-poster {
  position: relative;
  width: 100%;
  & img {
    width: 100%;
    height: calc(width * (16 / 9));
    object-fit: cover;
    display: block;
  }
}

.poster-card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(220, 20, 60, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

.poster-card-info {
  padding-left: $space-sm;
}

.poster-card-title {
  font-weight: 700;
  font: $font-size-lg;
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
