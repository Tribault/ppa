<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="close">✖</button>
      <img :src="src" :alt="alt" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
const props = defineProps<{
  visible: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits(["close"])

function close() {
  emit("close")
}

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  width: 100%;
  height: auto;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.close-btn:hover {
  background: #f0f0f0;
}
</style>
