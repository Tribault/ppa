<template>
  <div v-if="view === 'grid'" class="card-grid">
        <img v-if=poster.image :src="`http://localhost:5000/uploads/${poster.image}`" alt=""/>
         <EyeSlashIcon/>
        <div>
          <h3>{{ poster.title }}</h3>
          <p>Stock disponible : {{ poster.availableStock }}</p>
          <p v-if="poster.note">{{ poster.note }}</p>
          <p v-if="canBook">
             <p> {{ quantity }} affiche
             <button  @click="increment"
        :disabled="quantity >= poster.availableStock">
              <PlusIcon class="icon" />
            </button>
            <button  @click="decrement"
        :disabled="quantity <= 1">
              <MinusIcon class="icon" />
            </button></p><p>
            Prix total : {{ poster.price }} € 
            </p>
              <button @click="">
              Réserver
            </button>
              
          </p>
          <p v-else>{{ poster.price }} €</p>
        </div>
  </div>
  <div v-else class="card-list">
    <div>{{ poster.title }} </div>
    <div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import type {Poster} from '../types/models'
import {useAuthStore} from '../stores/auth'
import {computed, ref} from 'vue'
import { EyeSlashIcon, PlusIcon, MinusIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
    poster: Poster
    view: 'grid' | 'list'
}>()

const auth = useAuthStore()
const canBook = computed(() => auth.user?.role === 'user');
const quantity = ref<number>(1)

const bookPoster = async () => {
  try {
    await axios.post('/api/bookings', {
      posterId: props.poster._id,
      quantity: quantity.value
    });
    alert(`Booked ${quantity.value} copy/copies of "${props.poster.title}"`);
    quantity.value = 1;
  } catch (err : any) {
    alert(err.response?.data?.error || 'Booking failed')
  }
}

const increment = () => {
  if (quantity.value < props.poster.availableStock) {
    quantity.value++;
  }
}

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value--;
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

  & img{
    max-width: 150px;
  }
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