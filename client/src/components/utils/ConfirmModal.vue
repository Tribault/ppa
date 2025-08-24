<template>
  <Transition name="modal-fade">
    <div v-if="visible" class="confirm-modal">
      <div class="confirm-modal-box">
        <h2>Êtes-vous sûr de vouloir faire cette action ?</h2>
        <p>{{ message }}</p>
        <div class="confirm-modal-actions">
          <button class="btn-white-bg" @click="cancel">Annuler</button>
          <button class="btn-white-bg" @click="confirm">Oui</button>
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

<style scoped lang="scss">
.confirm-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  &-box {
    background: white;
    color: $red;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &-actions {
    button {
      width: 75px;
    }
    :first-child {
      margin-right: 8px;
    }
  }
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
