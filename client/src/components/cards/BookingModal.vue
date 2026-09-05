<template>
  <Transition name="booking-modal-fade">
    <div v-if="visible" class="booking-modal-overlay" @click="close">
      <div class="booking-modal-box" @click.stop>
        <button class="booking-modal-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

        <template v-if="!confirmed">
          <h2 class="booking-modal-title">{{ $t('posterDetails.bookTitle') }}</h2>
          <p class="booking-modal-poster-title">{{ poster.title }}</p>

          <div class="booking-modal-quantity">
            <span><b>{{ $t('posterDetails.quantityLabel') }}</b> {{ quantity }}</span>
            <button
              class="btn-red-bg"
              @click="increment"
              :disabled="quantity >= poster.stockInfo.availableStock"
            >
              <PlusIcon class="icon" />
            </button>
            <button class="btn-red-bg" @click="decrement" :disabled="quantity <= 1">
              <MinusIcon class="icon" />
            </button>
          </div>

          <p class="booking-modal-total"><b>{{ $t('posterDetails.totalPrice') }}</b> : {{ quantity * poster.price }} €</p>

          <button class="btn-red-bg booking-modal-submit" @click="addToBasket">
            {{ $t('posterDetails.book') }}
          </button>
        </template>

        <template v-else>
          <h2 class="booking-modal-title">{{ $t('posterDetails.bookConfirmedTitle') }}</h2>
          <p class="booking-modal-poster-title">{{ poster.title }}</p>

          <button class="btn-red-bg booking-modal-submit" @click="viewBasket">
            {{ $t('nav.viewBasket') }}
          </button>
          <button class="btn-white-bg booking-modal-submit" @click="close">
            {{ $t('posterDetails.close') }}
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Poster } from '@/types/models'
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '@/stores/auth'
import { useBasketStore } from '@/stores/basket'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  poster: Poster
}>()
const emit = defineEmits(['close', 'booked'])

const auth = useAuthStore()
const basketStore = useBasketStore()
const toast = useToast()
const { t } = useI18n()

const quantity = ref(1)
const confirmed = ref(false)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      quantity.value = basketStore.quantityFor(props.poster._id) || 1
      confirmed.value = false
    }
  },
)

function increment() {
  if (quantity.value < props.poster.stockInfo.availableStock) quantity.value++
}

function decrement() {
  if (quantity.value > 1) quantity.value--
}

function close() {
  emit('close')
}

function addToBasket() {
  if (!auth.user) return
  basketStore.setItem(props.poster, quantity.value)
  toast.success(t('posterDetails.bookSuccess'))
  emit('booked')
  confirmed.value = true
}

function viewBasket() {
  close()
  basketStore.open()
}
</script>

<style scoped lang="scss">
.booking-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-modal-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 360px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.booking-modal-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  padding: 4px;
  display: inline-flex;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.booking-modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.booking-modal-poster-title {
  opacity: 0.85;
  margin-bottom: 16px;
}

.booking-modal-quantity {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 12px;

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.booking-modal-total {
  margin-bottom: 16px;
}

.booking-modal-submit {
  width: 100%;
  justify-content: center;
  margin-bottom: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.booking-modal-fade-enter-active,
.booking-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.booking-modal-fade-enter-from,
.booking-modal-fade-leave-to {
  opacity: 0;
}
</style>
