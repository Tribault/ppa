<template class="poster-form">
  <Transition name="modal-fade">
    <div v-if="visible" class="modal-overlay">
      <Transition name="modal-popup">
        <div class="modal-box" @click.stop>
          <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="emit('close')">✖</button>

          <h2 class="text-xl font-bold mb-4">
            {{ bookingToEdit?._id ? 'Edit Booking' : 'New Booking' }}
          </h2>

          <form @submit.prevent="submit" class="space-y-3">
           <select v-model="form.posterId" required>
          <option disabled value="">-- Select a poster --</option>
          <option v-for="p in posterStore.posters" :key="p._id" :value="p._id">{{ p.title }}</option>
          </select>
            <select v-model="form.userId" required>
            <option disabled value="">-- Select a user --</option>
            <option v-for="u in userStore.users" :key="u._id" :value="u._id">{{ u.email }}</option>
            </select>
            <input v-model.number="form.quantity" placeholder="Quantity" class="input" />

            <div class="flex justify-between items-center mt-4">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">{{ bookingToEdit ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>

</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Booking, BookingPayload} from '@/types/models'
import { useBookingStore } from '@/stores/bookings'
import { useUserStore } from '@/stores/users'
import { usePosterStore } from '@/stores/posters'
import { useToast } from 'vue-toastification'
const toast = useToast()

const props = defineProps<{
  visible: boolean
  bookingToEdit: Booking | null
}>()

const emit = defineEmits(['close', 'saved'])

const form = ref<BookingPayload>({
  posterId: '' as string,
  userId: '' as string,
  quantity: 1,
})

const bookingStore = useBookingStore()
const userStore = useUserStore()
const posterStore = usePosterStore()

onMounted(async() => {
  await userStore.fetchUsers()
  await posterStore.fetchPosters()
})

async function submit() {
  if (props.bookingToEdit) {
    await bookingStore.updateBooking(props.bookingToEdit._id, form.value)
  } else {
    await bookingStore.createBooking(form.value)
  }
  emit('saved')
  emit('close')
}

watch(
  () => props.bookingToEdit,
  (booking) => {
    if (booking) {
      form.value = {
        userId: booking.user._id,
        posterId: booking.poster._id,
        quantity: booking.quantity,
      }
    } else {
      form.value = {
        userId: '',
        posterId: '',
        quantity: 1,
      }
    }
  },
  { immediate: true } // run once right away in case the prop is already set
)

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-popup-enter-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.modal-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
