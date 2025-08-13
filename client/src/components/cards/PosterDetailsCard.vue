<template >
    <div class="poster-details-card">
    <div class="poster-details-card-image">
        <ArrowUturnLeftIcon class="poster-details-card-back"/>
        <img :src="imgUrl" alt=""></div>
    <div class="poster-details-card-data">
        <ul>
        <li class="poster-details-card-data--title title"> {{ poster.title }}</li>
        <li class="poster-details-card-data--price"><b>Prix :</b> {{ poster.price }} €</li>
        <li class="poster-details-card-data--size"><b>Taille :</b> {{ poster.size }}</li>
        <li class="poster-details-card-data--stock"><b>Affiches disponibles :</b> {{ poster.availableStock }}</li>
        <li class="poster-details-card-data--note"><b>Commentaire :</b> <i>{{ poster.note }}</i></li>
        </ul>
    </div>
    </div>
 
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import { useBookingStore } from '@/stores/bookings'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import {
  ArrowUturnLeftIcon
} from '@heroicons/vue/24/solid'

import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  poster: Poster
  admin?: boolean
}>()

const emit = defineEmits(['edit', 'updated'])

const posterStore = usePosterStore()
const bookingStore = useBookingStore()

const imgUrl = ref<string>(import.meta.env.VITE_IMG_URL + props.poster.image)

const auth = useAuthStore()

const confirmDeleteVisible = ref(false)

</script>

<style lang="scss" scoped>
.poster-details-card{
    width:100%;
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
      @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.poster-details-card-back{
    max-width: 100px;
    color:$red;
    padding-left: $space-sm;
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
    padding: $space-sm;
    flex-direction: column;
    height:100%;
    align-items: start;
  justify-content: center;
  background: $red;
  color: white;

  ul{
    list-style-type: none;
    li{
        padding: 1rem 0;
    }

  }
}
</style>
