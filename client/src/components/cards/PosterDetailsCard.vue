<template>
  <div class="poster-details-card">
    <router-link to="/" class="poster-details-card-back">
      <ArrowUturnLeftIcon />
    </router-link>
    <div class="poster-details-card-image">
      <img v-if="posterInfo.image"
        :src="imgUrl.value"
        :class="{
          grayscale: posterInfo.stockInfo.availableStock == 0,
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
            {{ posterInfo.title }} ({{ posterInfo.size }})
            <button v-if="auth.isAdmin" class="btn-red-bg" @click="isEditing = true">
              <pencil-icon />
            </button>
          </li>
          <li class="poster-details-card-data--tags">
            <span v-for="t in posterInfo.tags" class="tag-white">{{ t.name }}</span>
          </li>
          <li class="poster-details-card-data--price"><b>{{ $t('posterDetails.price') }}</b> {{ posterInfo.price }} €</li>
          <li class="poster-details-card-data--size"><b>{{ $t('posterDetails.size') }}</b> {{ posterInfo.size }}</li>
          <li v-if="posterInfo.filmmaker" class="poster-details-card-data--filmmaker">
            <b>{{ $t('posterDetails.filmmaker') }}</b> {{ posterInfo.filmmaker }}
          </li>
          <li v-if="posterInfo.year" class="poster-details-card-data--year">
            <b>{{ $t('posterDetails.year') }}</b> {{ posterInfo.year }}
          </li>
          <li v-if="posterInfo.mainActors?.length" class="poster-details-card-data--actors">
            <b>{{ $t('posterDetails.mainActors') }}</b> {{ posterInfo.mainActors.join(', ') }}
          </li>
          <li v-if="posterInfo.genre" class="poster-details-card-data--genre">
            <b>{{ $t('posterDetails.genre') }}</b> {{ posterInfo.genre }}
          </li>
          <li v-if="posterInfo.country" class="poster-details-card-data--country">
            <b>{{ $t('posterDetails.country') }}</b> {{ posterInfo.country }}
          </li>
          <li v-if="auth.isAdmin" class="poster-details-card-data--stock">
            <b>{{ $t('posterDetails.totalStock') }}</b> {{ posterInfo.totalStock }}
          </li>
          <li v-else class="poster-details-card-data--stock">
            <b>{{ $t('posterDetails.availableStock') }}</b> {{ posterInfo.stockInfo.availableStock }}
          </li>
          <li class="poster-details-card-data--note">
            <b>{{ $t('posterDetails.comment') }}</b> <i>{{ posterInfo.note }}</i>
          </li>
        </ul>
      </div>
      <div class="poster-details-card-admin" v-if="auth.isAdmin">
        <router-link to="/admin" class="btn-red-bg">{{ $t('posterDetails.adminDashboard') }}</router-link>
      </div>
      <div class="poster-details-card-booking" v-if="canBook">
        <ul>
          <li class="title">{{ $t('posterDetails.bookTitle') }}</li>
          <li><button class="btn-white-bg" @click="showBookingModal = true">{{ $t('posterDetails.book') }}</button></li>
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
  <booking-modal
    :visible="showBookingModal"
    :poster="posterInfo"
    @close="showBookingModal = false"
    @booked="onBooked"
  />
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { usePosterStore } from '@/stores/posters'
import { useMessageStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, onMounted } from 'vue'
import { ArrowUturnLeftIcon, PencilIcon } from '@heroicons/vue/24/solid'

import PosterEdit from '@/components/edition/PosterEdit.vue'
import BookingModal from '@/components/cards/BookingModal.vue'

const props = defineProps<{
  poster: Poster
}>()

const emit = defineEmits(['edit', 'updated'])

const auth = useAuthStore()
const posterStore = usePosterStore()
const messageStore = useMessageStore()

const isEditing = ref<boolean>(false)
const showBookingModal = ref(false)

const posterInfo = computed(() => {
  return posterStore.poster ?? props.poster
})


const imgUrl = computed(() => ref<string>(import.meta.env.VITE_IMG_URL + posterInfo.value.image))

const canBook = computed(() => auth.user?.role === 'user' && posterInfo.value.stockInfo.availableStock > 0 && messageStore.message?.bookingAllowed)



async function refreshData() {
  await posterStore.fetchPoster(posterInfo.value._id)
}

async function onBooked() {
  await refreshData()
  emit('updated')
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

    // The 100vh calc above assumes the desktop layout, where the back button
    // sits beside the image. On mobile everything stacks (header, back
    // button, image, data), so that fixed offset leaves way less room than
    // it assumes — the image ends up taller than what's left of the
    // viewport, pushing itself and the data below off-screen.
    @media (max-width: 768px) {
      height: auto;
      max-height: 60vh;
    }
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
}
</style>
