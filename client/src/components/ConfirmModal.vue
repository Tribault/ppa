<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-box">
        <h2 class="text-lg font-bold mb-2">Êtes-vous sûr de vouloir faire cette action ?</h2>
        <p class="mb-4 text-gray-600">{{ message }}</p>
        <div class="flex justify-center gap-4">
          <button @click="cancel" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button @click="confirm" class="px-4 py-2 bg-red-600 text-white rounded">
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean; message: string }>()
const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}
function cancel() {
  emit('cancel')
}
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
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
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
