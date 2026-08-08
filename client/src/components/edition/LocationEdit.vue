<template>
  <div v-if="visible" class="location-modal-overlay" @click="close">
    <div class="location-modal-box" @click.stop>
      <button class="close-btn" @click="close">✖</button>
      <h2>{{ $t('form.location.title') }}</h2>

      <!-- List of existing locations -->
      <ul class="location-list">
        <li v-for="location in locationStore.locations" :key="location._id" class="location-item">
          {{ location.name }}
        </li>
      </ul>

      <!-- Create new location -->
      <form @submit.prevent="createLocation" class="location-form">
        <input v-model="newLocation" type="text" :placeholder="$t('form.location.placeholder')" class="location-input" />
        <button type="submit" class="btn-red-bg">{{ $t('form.location.add') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocationStore } from '@/stores/locations'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close'])

const locationStore = useLocationStore()
const newLocation = ref('')

onMounted(async () => {
  await locationStore.fetchLocations()
})

function close() {
  emit('close')
}

async function createLocation() {
  if (!newLocation.value.trim()) return
  try {
    await locationStore.createLocation({ name: newLocation.value })
    newLocation.value = ''
  } catch (err) {
    console.error('Impossible de créer la localisation', err)
  }
}
</script>

<style scoped lang="scss">
.location-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.location-modal-box {
  background: $darker-red;
  color: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-width: 95%;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.location-list {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.location-item {
  background: $darker-red;
  border: solid 1px white;
  padding: 6px 10px;
  margin: 4px 0;
  border-radius: 6px;
  font-size: 14px;
}

.location-form {
  display: flex;
  gap: 8px;
}

.location-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
</style>
