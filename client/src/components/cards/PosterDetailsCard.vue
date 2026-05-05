<template>
  <div class="poster-details-card">
    <router-link to="/" class="poster-details-card-back">
      <ArrowUturnLeftIcon />
    </router-link>
    <div class="poster-details-card-image">
      <img v-if="posterInfo.image"
        :src="imgUrl.value"
        :class="{
          greyscale: posterInfo.stockInfo.availableStock == 0,
        }"
        alt=""
      />
      <img v-else
      src = "@/assets/404.svg"
      />
    </div>
    <div class="poster-details-card-data">
      <div>
        <ul>
          <li class="poster-details-card-data--title title">
            {{ posterInfo.title }}
            <button v-if="auth.isAdmin" class="btn-red-bg" @click="isEditing = true">
              <pencil-icon />
            </button>
          </li>
          <li class="poster-details-card-data--tags">
            <span v-for="t in posterInfo.tags" class="tag-white">{{ t.name }}</span>
          </li>
          <li class="poster-details-card-data--price"><b>Prix :</b> {{ posterInfo.price }} €</li>
          <li class="poster-details-card-data--size"><b>Taille :</b> {{ posterInfo.size }}</li>
          <li v-if="auth.isAdmin" class="poster-details-card-data--stock">
            <b>Stock d'affiches :</b> {{ posterInfo.totalStock }}
          </li>
          <li v-else class="poster-details-card-data--stock">
            <b>Affiches disponibles :</b> {{ posterInfo.stockInfo.availableStock }}
          </li>
          <li class="poster-details-card-data--note">
            <b>Commentaire :</b> <i>{{ posterInfo.note }}</i>
          </li>
        </ul>
      </div>
      <div class="poster-details-card-admin" v-if="auth.isAdmin">
        <router-link to="/admin" class="btn-red-bg">Tableau de bord admin →</router-link>
      </div>
      <div class="poster-details-card-booking" v-if="canBook">
        <ul>
          <li class="title">Réserver l'affiche</li>
          <li class="poster-details-card-booking--info">
            <span><b>Nombre d'affiches :</b> {{ quantity }}</span>
            <button
              class="btn-white-bg"
              @click="increment"
              :disabled="quantity >= posterInfo.stockInfo.availableStock"
            >
              <PlusIcon class="icon" />
            </button>
            <button class="btn-white-bg" @click="decrement" :disabled="quantity <= 1">
              <MinusIcon class="icon" />
            </button>
          </li>
          <li><b>Prix total</b> : {{ quantity * posterInfo.price }} €</li>
          <li><button class="btn-white-bg" @click="bookPoster">Réserver</button></li>
        </ul>
      </div>
    </div>
  </div>
  <poster-edit
    :poster-to-edit="posterStore.poster"
    :visible="isEditing"
    @saved="refreshData"
    @close="isEditing = false"
  />
</template>

<script setup lang="ts">
import type { BookingPayload, Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import { useBookingStore } from '@/stores/bookings'
import { useMessageStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, onMounted } from 'vue'
import { ArrowUturnLeftIcon, PlusIcon, MinusIcon, PencilIcon } from '@heroicons/vue/24/solid'

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
const messageStore = useMessageStore()

const quantity = ref<number>(1)
const isEditing = ref<boolean>(false)

const posterInfo = computed(() => {
  return posterStore.poster ?? props.poster
})


const imgUrl = computed(() => ref<string>(import.meta.env.VITE_IMG_URL + posterInfo.value.image))

const canBook = computed(() => auth.user?.role === 'user' && posterInfo.value.stockInfo.availableStock > 0 && messageStore.message?.bookingAllowed)



async function refreshData() {
  await posterStore.fetchPoster(posterInfo.value._id)
}

const increment = () => {
  if (quantity.value < posterInfo.value.stockInfo.availableStock) {
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
    if (auth.user) {
      const formData: BookingPayload = {
        posterId: props.poster._id,
        userId: auth.user._id,
        quantity: quantity.value,
      }
      await bookingStore.createBooking(formData)
      toast.success('Réservation confirmée !')
    }
    quantity.value = 1
    await refreshData()
    emit('updated')
  } catch (err: any) {
    await refreshData()
    toast.error(err.response?.data?.error || 'Erreur durant la réservation.')
  }
}

onMounted(()=>{
  posterStore.poster = props.poster
  messageStore.fetchMessage()
})
</script>

<style lang="scss" scoped>
.poster-details-card {
  width: 100%;
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  align-items: start;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: unset;
  }
}

.poster-details-card-back {
  display: flex;
  max-width: 100%;
  color: $red;
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

.poster-details-card-image {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    height: calc(100vh - 158px);
    width: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
}

.poster-details-card-data {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: start;
  justify-content: center;
  background: $darker-red;
  color: white;

  ul {
    list-style-type: none;
    padding-left: 1rem;
    @media (max-width: 768px) {
      padding-left: 0.5rem;
    }
    li {
      padding: 0.8rem 0;
    }
  }
}

.poster-details-card-admin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: white;
}

.poster-details-card-booking {
  background-color: white;
  color: $red;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  &--info {
    display: flex;
    align-items: center;
    > * {
      margin-right: 1rem;
    }
  }
}
</style>
