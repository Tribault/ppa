<template class="booking-edit">
  <Transition name="booking-edit-fade">
    <div v-if="visible" class="booking-edit-overlay">
      <Transition name="booking-edit-popup">
        <div class="booking-edit-box" @click.stop>
          <button class="booking-edit-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

          <h2 class="booking-edit-title">
            {{ bookingToEdit?._id ? `Modification de réservation` : `Création de réservation` }}
          </h2>
          <form @submit.prevent="submit" class="booking-edit-form">
             <div v-if="authStore.isAdmin">
            <div class="booking-edit-form--row">
              <b>Affiche</b>
              <database-search
                :selected-label="bookingToEdit?.poster?.title"
                search-type="poster"
                @value-selected="(p) => (form.posterId = p)"
              />
            </div>
            <div class="booking-edit-form--row">
              <b>Client</b>
              <database-search
                :selected-label="bookingToEdit?.user?.email"
                search-type="user"
                @value-selected="(u) => (form.userId = u)"
              />
            </div>
            <div v-if="bookingToEdit?._id" class="booking-edit-form--row">
              <b>Status</b>
              <input type="radio" id="pending" value="pending" v-model="form.status" />
              <label for="pending">En cours</label>
              <input type="radio" id="validated" value="validated" v-model="form.status" />
              <label for="validated">Validée</label>
            </div>
            </div>
            <div class="booking-edit-form--row">
              <b>Quantité</b
              ><input
                v-model.number="form.quantity"
                type="number"
                placeholder="Quantity"
                class="booking-edit-input"
              />
            </div>

            <div class="booking-edit-form--actions">
              <button type="submit" class="btn-red-bg">
                <b>Sauvegarder</b> <folder-arrow-down-icon />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Booking } from '@/types/models'
import { XMarkIcon, FolderArrowDownIcon } from '@heroicons/vue/24/solid'
import { useBookingStore } from '@/stores/bookings'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import DatabaseSearch from '@/components/utils/DatabaseSearch.vue'
const toast = useToast()

const props = defineProps<{
  visible: boolean
  bookingToEdit: Booking | null
}>()
const emit = defineEmits(['close', 'saved'])

const bookingStore = useBookingStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const form = ref<{
  userId: string
  posterId: string
  quantity: number
  status: string
}>({
  userId: '',
  posterId: '',
  quantity: 1,
  status: 'pending',
})

const previewUrl = ref<string>('')

onMounted(async () => {
  await userStore.fetchUsers()
})

watch(
  () => props.bookingToEdit,
  (val) => {
    if (val) {
      form.value = {
        userId: val.user._id,
        posterId: val.poster._id,
        quantity: val.quantity,
        status: val.status,
      }
    } else {
      form.value = { userId: '', posterId: '', quantity: 1, status: 'pending' }
      previewUrl.value = ''
    }
  },
  { immediate: true },
)

function close() {
  emit('close')
}

async function submit() {
  try {
    if (props.bookingToEdit?._id) {
      await bookingStore.updateBooking(props.bookingToEdit._id, form.value)
      toast.success('Booking updated ✅')
    } else {
      await bookingStore.createBooking(form.value)
      toast.success('Booking created 🎉')
    }

    emit('saved')
    close()
  } catch (err) {
    console.error(err)
    toast.error('An error occurred ❌')
  }
}
</script>

<style scoped lang="scss">
.booking-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.booking-edit-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.booking-edit-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
}

.booking-edit-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.booking-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--row {
    display: flex;
    width: 90%;
    align-items: center;
    justify-content: space-between;

    &:first-of-type {
      input {
        border: unset;
      }
    }
  }

  &--actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    button > b {
      margin-right: 8px;
    }
  }
}

.booking-edit-input {
  padding: 8px 10px;
  margin-left: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex-grow: 1;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }
}

/* Transitions */
.booking-edit-fade-enter-active,
.booking-edit-fade-leave-active {
  transition: opacity 0.25s ease;
}
.booking-edit-fade-enter-from,
.booking-edit-fade-leave-to {
  opacity: 0;
}

.booking-edit-popup-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.booking-edit-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.booking-edit-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
