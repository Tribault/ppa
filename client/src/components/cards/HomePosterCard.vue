<template class="poster-card">
  <div v-if="view === 'grid'" @click="emit('details')" class="poster-card-grid" :class="{ 'no-image': !poster.image }">
    <div v-if="poster.image" class="poster-card-poster">
      <img :src="imgUrl" alt="" />
      <div class="poster-card-badges">
        <div v-for="t in poster.tags" :key="t._id" class="poster-card-badge">{{ t.name }}</div>
      </div>
      <button
        class="poster-card-book-btn"
        :class="{ disabled: !canBook }"
        :disabled="!canBook"
        :title="$t('posterDetails.book')"
        :aria-label="$t('posterDetails.book')"
        @click.stop="openBooking"
      >
        <PlusIcon class="icon" />
      </button>
    </div>
    <div v-else class="poster-card-poster no-logo">
      <EyeSlashIcon />
      <button
        class="poster-card-book-btn"
        :class="{ disabled: !canBook }"
        :disabled="!canBook"
        :title="$t('posterDetails.book')"
        :aria-label="$t('posterDetails.book')"
        @click.stop="openBooking"
      >
        <PlusIcon class="icon" />
      </button>
    </div>
    <div class="poster-card-info">
      <div class="poster-card-title">{{ poster.title }}</div>
      <div>{{ poster.price }} €</div>
    </div>
  </div>
  <div v-else @click="emit('details')" class="poster-card-list">
    <div class="poster-card-list--title">{{ poster.title }}</div>
    <div class="poster-card-list--tag-container">
      <div v-for="t in poster.tags" class="poster-card-list--tags">{{ t.name }}</div>
    </div>
    <div>{{ poster.price }} €</div>
  </div>

  <booking-modal
    :visible="showBookingModal"
    :poster="poster"
    @close="showBookingModal = false"
    @booked="emit('booked')"
  />
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { ref, computed } from 'vue'
import { EyeSlashIcon } from '@heroicons/vue/24/solid'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/messages'
import BookingModal from '@/components/cards/BookingModal.vue'

const props = defineProps<{
  poster: Poster
  view: 'grid' | 'list'
}>()

const emit = defineEmits(['details', 'booked'])

const auth = useAuthStore()
const messageStore = useMessageStore()

const imgUrl = ref<string>(import.meta.env.VITE_IMG_URL + props.poster.image)
const showBookingModal = ref(false)

const canBook = computed(
  () =>
    auth.user?.role === 'user' &&
    props.poster.stockInfo.availableStock > 0 &&
    messageStore.message?.bookingAllowed,
)

function openBooking() {
  if (!canBook.value) return
  showBookingModal.value = true
}
</script>

<style lang="scss" scoped>
.poster-card-list:nth-child(even) {
  background-color: $red;
  color: white;

  .poster-card-list--tags {
    background-color: white;
    color: $red;
  }
}

.poster-card-grid {
  width: 300px;
  height: 525px;
  color: white;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  display: flex;
  flex-direction: column;

  &.no-image {
    background-color: $red;
  }
}

.poster-card-list {
  width: 100%;
  height: 50px;
  display: flex;
  color: $red;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;

  &--title {
    font-weight: 900;
  }

  &--tag-container {
    display: flex;
    gap: 0.5rem;
  }

  &--tags {
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
}

.poster-card-poster {
  position: relative;
  flex: 1;
  overflow: hidden;
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.poster-card-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.poster-card-badge {
  background-color: rgba(220, 20, 60, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  white-space: nowrap;
}

.poster-card-book-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $red;
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background-color 0.2s ease;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    color: white;
    stroke-width: 3;
  }

  &:hover:not(.disabled) {
    background-color: $darker-red;
  }

  &.disabled {
    background-color: #999;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.poster-card-info {
  background-color: $red;
  padding: $space-sm;
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

.no-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-list {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
  justify-content: space-between;
}
</style>
