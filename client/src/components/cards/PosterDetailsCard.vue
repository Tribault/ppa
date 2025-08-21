<template >
    <div class="poster-details-card">
      <router-link to="/" class="poster-details-card-back">
        <ArrowUturnLeftIcon />
      </router-link>
    <div class="poster-details-card-image">
    <img :src="imgUrl.value" :class="{
      greyscale : poster.availableStock == 0 }" alt="">
  </img>
    
    </div>
    <div class="poster-details-card-data">
      <div>
        <ul>
        <li class="poster-details-card-data--title title"> {{ poster.title }} 
          <button v-if="auth.isAdmin" class="btn-red-bg" @click="isEditing = true"><pencil-icon /></button>
        </li>
        <li class="poster-details-card-data--tags"><span v-for="t in poster.tags" class="tag-white">{{ t.name }}</span></li>
        <li class="poster-details-card-data--price"><b>Prix :</b> {{ poster.price }} €</li>
        <li class="poster-details-card-data--size"><b>Taille :</b> {{ poster.size }}</li>
        <li v-if ="auth.isAdmin" class="poster-details-card-data--stock"><b>Stock d'affiches :</b> {{ poster.totalStock }}</li>
         <li v-else class="poster-details-card-data--stock"><b>Affiches disponibles :</b> {{ poster.availableStock }}</li>
        <li class="poster-details-card-data--note"><b>Commentaire :</b> <i>{{ poster.note }}</i></li>
        </ul>
      </div>
    <div class="poster-details-card-booking" v-if="canBook">
      <ul> 
      <li class="title"> Réserver l'affiche</li>
        <li class="poster-details-card-booking--info">
          <span><b>Nombre d'affiches :</b> {{quantity}}</span>
          <button class="btn-white-bg" @click="increment" :disabled="quantity >= poster.availableStock">
           <PlusIcon class="icon" />
            </button>
              <button class="btn-white-bg" @click="decrement" :disabled="quantity <= 1">
        <MinusIcon class="icon" />
      </button>
    </li>
      <li>
        <b>Prix total</b> : {{ quantity * poster.price }} € 
      </li>
      <li><button class="btn-white-bg" @click="bookPoster">Réserver</button></li>
    </ul>
    </div>
    </div>
    </div>
 <poster-edit :poster-to-edit="posterStore.poster" :visible="isEditing" @saved="refreshData" @close="isEditing = false"/>
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import { useBookingStore } from '@/stores/bookings'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import {
  ArrowUturnLeftIcon, PlusIcon, MinusIcon, PencilIcon
} from '@heroicons/vue/24/solid'

import PosterEdit from '@/components/edition/PosterEdit.vue'

import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  poster: Poster
}>()

const emit = defineEmits(['edit', 'updated'])


const auth = useAuthStore()
const posterStore = usePosterStore()
const bookingStore = useBookingStore()

const quantity = ref<number>(1)
const isEditing = ref<boolean>(false)
const imgUrl = computed(() => ref<string>(import.meta.env.VITE_IMG_URL + props.poster.image))

const canBook = computed(() => auth.user?.role === 'user' && props.poster.availableStock > 0)

function refreshData(){
  posterStore.fetchPoster(props.poster._id)
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

const bookPoster = async () => {
  try {
    if (auth.user)
      bookingStore.createBooking({
        posterId: props.poster._id,
        userId: auth.user._id,
        quantity: quantity.value,
      })
    quantity.value = 1
    toast.success('Réservation confirmée !')
    emit('updated')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erreur durant la réservation.')
  }
}

</script>

<style lang="scss" scoped>
.poster-details-card{
    width:100%;
    display:grid;
    grid-template-columns: 100px 1fr 1fr;
    align-items: start;
      @media (max-width: 768px) {
    grid-template-columns: 1fr;
        gap: unset;
  }
}

.poster-details-card-back{
  display: flex;
    max-width: 100%;
    color:$red;
    padding-left: $space-sm;
    align-self: center;

      @media (max-width: 768px) {
      padding-left: unset;
      max-width: 100%;
      justify-content: center;

      > * {
        max-width: 25%;
      }
  }
}

.poster-details-card-image{
    display:flex;
    align-items: center;
  justify-content: center;
    img{
        height: calc(100vh - 158px);
        width:  100%;
        object-fit: contain;
            border-radius: 8px;
    }
}

.poster-details-card-data{
    display:flex;
    flex-direction: column;
    height:100%;
    align-items: start;
  justify-content: center;
  background: $darker-red;
  color: white;

  ul{
    list-style-type: none;
    padding-left:1rem;
       @media (max-width: 768px) {
    padding-left: 0.5rem;
  }
    li{
        padding: 0.8rem 0;
    }

  }
}

.poster-details-card-booking{
  background-color: white;
  color:$red;
  width:100%;
  height: 100%;
  display: flex;
  align-items: center;

  &--info{
    display:flex;
    align-items: center;
    >* {
      margin-right: 1rem;
    }
  }

}

</style>
