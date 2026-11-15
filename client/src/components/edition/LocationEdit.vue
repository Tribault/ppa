<template>
  <div v-if="visible" class="location-modal-overlay" @click="close">
    <div class="location-modal-box" @click.stop>
      <button class="close-btn" @click="close">✖</button>
      <h2>{{ $t('form.location.title') }}</h2>

      <!-- List of existing locations -->
      <ul class="location-list">
        <li v-for="location in locationStore.locations" :key="location._id" class="location-item">
          <template v-if="editingId === location._id">
            <input
              v-model="editingName"
              v-focus
              type="text"
              class="location-input location-item-input"
              @keydown.enter.prevent="saveEdit"
              @keydown.esc.stop="cancelEdit"
            />
            <span class="location-item-actions">
              <button type="button" class="location-item-btn" :title="$t('form.location.save')" @click="saveEdit">
                <check-icon class="icon" />
              </button>
              <button type="button" class="location-item-btn" :title="$t('form.location.cancel')" @click="cancelEdit">
                <x-mark-icon class="icon" />
              </button>
            </span>
          </template>
          <template v-else>
            <span>{{ location.name }}</span>
            <span class="location-item-actions">
              <button type="button" class="location-item-btn" :title="$t('form.location.edit')" @click="startEdit(location)">
                <pencil-icon class="icon" />
              </button>
              <button type="button" class="location-item-btn" @click="confirmDelete(location)">
                <trash-icon class="icon" />
              </button>
            </span>
          </template>
        </li>
      </ul>

      <!-- Create new location -->
      <form @submit.prevent="createLocation" class="location-form">
        <input v-model="newLocation" type="text" :placeholder="$t('form.location.placeholder')" class="location-input" />
        <button type="submit" class="btn-red-bg">{{ $t('form.location.add') }}</button>
      </form>
    </div>
  </div>
  <confirm-modal
    :message="$t('form.location.deleteConfirm')"
    :visible="showDeleteModal"
    @cancel="showDeleteModal = false"
    @confirm="deleteConfirmed"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocationStore } from '@/stores/locations'
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close'])

const locationStore = useLocationStore()
const toast = useToast()
const { t } = useI18n()
const newLocation = ref('')

const showDeleteModal = ref(false)
const locationToDelete = ref<{ _id: string; name: string } | null>(null)

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

// Inline rename
const editingId = ref<string | null>(null)
const editingName = ref('')
const vFocus = { mounted: (el: HTMLElement) => el.focus() }

function startEdit(item: { _id: string; name: string }) {
  editingId.value = item._id
  editingName.value = item.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit() {
  const id = editingId.value
  const name = editingName.value.trim()
  if (!id || !name) return
  try {
    await locationStore.updateLocation(id, { name })
    cancelEdit()
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('form.location.updateError'))
  }
}

function confirmDelete(location: { _id: string; name: string }) {
  locationToDelete.value = location
  showDeleteModal.value = true
}

async function deleteConfirmed() {
  if (!locationToDelete.value) return
  try {
    await locationStore.deleteLocation(locationToDelete.value._id)
  } catch (err) {
    console.error('Impossible de supprimer la localisation', err)
    toast.error(t('form.location.deleteError'))
  } finally {
    showDeleteModal.value = false
    locationToDelete.value = null
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.location-item-actions {
  display: inline-flex;
  gap: 4px;
  flex-shrink: 0;
}

.location-item-input {
  min-width: 0;
  padding: 2px 6px;
}

.location-item-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;

  .icon {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: #ffb3b3;
  }
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
