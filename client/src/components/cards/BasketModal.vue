<template>
  <Transition name="basket-modal-fade">
    <div v-if="basketStore.isOpen" class="basket-modal-overlay" @click="close">
      <div class="basket-modal-box" @click.stop>
        <button class="basket-modal-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

        <template v-if="!confirmed">
          <h2 class="basket-modal-title">{{ $t('basket.title') }}</h2>

          <p v-if="basketStore.items.length === 0" class="basket-modal-empty">{{ $t('basket.empty') }}</p>

          <ul v-else class="basket-modal-items">
            <li v-for="item in basketStore.items" :key="item.poster._id" class="basket-modal-item">
              <div class="basket-modal-item--info">
                <span class="basket-modal-item--title">{{ item.poster.title }}</span>
                <span>{{ item.poster.price }} €</span>
              </div>
              <div class="basket-modal-item--quantity">
                <span><b>{{ $t('basket.quantityLabel') }}</b> {{ item.quantity }}</span>
                <button
                  class="btn-red-bg"
                  @click="basketStore.setItem(item.poster, item.quantity + 1)"
                  :disabled="item.quantity >= item.poster.stockInfo.availableStock"
                >
                  <PlusIcon class="icon" />
                </button>
                <button
                  class="btn-red-bg"
                  @click="basketStore.setItem(item.poster, item.quantity - 1)"
                  :disabled="item.quantity <= 1"
                >
                  <MinusIcon class="icon" />
                </button>
                <button class="btn-red-bg" :title="$t('basket.remove')" @click="basketStore.removeItem(item.poster._id)">
                  <TrashIcon class="icon" />
                </button>
              </div>
            </li>
          </ul>

          <p v-if="basketStore.items.length" class="basket-modal-total">
            <b>{{ $t('basket.total') }}</b> {{ basketStore.totalPrice }} €
          </p>

          <p v-if="!bookingAllowed" class="basket-modal-disabled-notice">{{ $t('basket.bookingDisabled') }}</p>

          <button
            v-if="basketStore.items.length"
            class="btn-red-bg basket-modal-submit"
            @click="confirmBasket"
            :disabled="confirming || !bookingAllowed"
          >
            {{ confirming ? $t('basket.confirming') : $t('basket.confirm') }}
          </button>
        </template>

        <template v-else>
          <h2 class="basket-modal-title">{{ $t('basket.confirmedTitle') }}</h2>

          <p v-if="saleDateStore.saleDate?.date" class="basket-modal-sale-date">
            {{ $t('basket.saleDateReminder', { date: formattedSaleDate }) }}
          </p>

          <p class="basket-modal-pickup-notice">{{ $t('basket.pickupNotice') }}</p>
          <p class="basket-modal-pickup-address">{{ $t('basket.pickupAddress') }}</p>

          <button class="btn-red-bg basket-modal-submit" @click="close">
            {{ $t('basket.close') }}
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { useBasketStore } from '@/stores/basket'
import { useSaleDateStore } from '@/stores/saleDate'
import { useMessageStore } from '@/stores/messages'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const basketStore = useBasketStore()
const saleDateStore = useSaleDateStore()
const messageStore = useMessageStore()
const toast = useToast()
const { t, locale } = useI18n()

const confirming = ref(false)
const confirmed = ref(false)

const bookingAllowed = computed(() => messageStore.message?.bookingAllowed ?? true)

const formattedSaleDate = computed(() => {
  const date = saleDateStore.saleDate?.date
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

watch(
  () => basketStore.isOpen,
  (v) => {
    if (v) {
      confirmed.value = false
      saleDateStore.fetchSaleDate()
    }
  },
)

function close() {
  basketStore.close()
}

async function confirmBasket() {
  confirming.value = true
  try {
    await basketStore.confirmBasket()
    confirmed.value = true
  } catch (err: any) {
    toast.error(err.response?.data?.error || t('basket.confirmError'))
  } finally {
    confirming.value = false
  }
}
</script>

<style scoped lang="scss">
.basket-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.basket-modal-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.basket-modal-close-btn {
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

.basket-modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.basket-modal-empty {
  opacity: 0.85;
}

.basket-modal-items {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.basket-modal-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 12px;

  &--info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  &--title {
    font-weight: 700;
  }

  &--quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .icon {
      width: 1.1rem;
      height: 1.1rem;
    }
  }
}

.basket-modal-total {
  margin-bottom: 16px;
}

.basket-modal-disabled-notice {
  margin-bottom: 16px;
  line-height: 1.4;
}

.basket-modal-sale-date {
  margin-bottom: 16px;
  line-height: 1.4;
}

.basket-modal-pickup-notice {
  line-height: 1.4;
}

.basket-modal-pickup-address {
  margin-bottom: 16px;
  white-space: pre-line;
  font-weight: bold;
}

.basket-modal-submit {
  width: 100%;
  justify-content: center;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.basket-modal-fade-enter-active,
.basket-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.basket-modal-fade-enter-from,
.basket-modal-fade-leave-to {
  opacity: 0;
}
</style>
