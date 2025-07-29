<template>
  <div v-if="view === 'grid'" class="card-grid">
    <img v-if="poster.image" :src="`http://localhost:5000/uploads/${poster.image}`" alt="" />
    <EyeSlashIcon />
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
    <td><button>Image</button></td>
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
      <button @click="$emit('edit', poster)">Modifier</button>
      <button @click="deletePoster(poster._id)">Supprimer</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import axios from 'axios'
import type { Poster } from '../types/models'
import { useAuthStore } from '../stores/auth'
import { computed, ref } from 'vue'
import { EyeSlashIcon, PlusIcon, MinusIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  poster: Poster
  admin?: boolean
  columns: { key: string; label: string; manual?: boolean }[]
  view: 'grid' | 'list'
}>()

const emit = defineEmits(['edit', 'updated'])

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
    await axios.post(
      'http://localhost:5000/api/bookings',
      {
        posterId: props.poster._id,
        quantity: quantity.value,
      },
      { headers: { Authorization: `Bearer ${auth.token}` } },
    )
    alert(`Booked ${quantity.value} copy/copies of "${props.poster.title}"`)
    quantity.value = 1
  } catch (err: any) {
    alert(err.response?.data?.error || 'Booking failed')
  }
}

const deletePoster = async (id: string) => {
  await axios.delete(`http://localhost:5000/api/posters/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  emit('updated')
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
