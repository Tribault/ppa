<template>
  <div v-if="visible" class="tag-modal-overlay" @click="close">
    <div class="tag-modal-box" @click.stop>
      <button class="close-btn" @click="close">✖</button>
      <h2>{{ $t('form.tag.title') }}</h2>

      <!-- List of existing tags -->
      <ul class="tag-list">
        <li v-for="tag in tagStore.tags" :key="tag._id" class="tag-item">
          <span>{{ tag.name }}</span>
          <button type="button" class="tag-item-delete" @click="confirmDelete(tag)">
            <trash-icon class="icon" />
          </button>
        </li>
      </ul>

      <!-- Create new tag -->
      <form @submit.prevent="createTag" class="tag-form">
        <input v-model="newTag" type="text" :placeholder="$t('form.tag.placeholder')" class="tag-input" />
        <button type="submit" class="btn-red-bg">{{ $t('form.tag.add') }}</button>
      </form>
    </div>
  </div>
  <confirm-modal
    :message="$t('form.tag.deleteConfirm')"
    :visible="showDeleteModal"
    @cancel="showDeleteModal = false"
    @confirm="deleteConfirmed"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTagStore } from '@/stores/tags'
import { TrashIcon } from '@heroicons/vue/24/solid'
import ConfirmModal from '@/components/utils/ConfirmModal.vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close'])

const tagStore = useTagStore()
const toast = useToast()
const { t } = useI18n()
const newTag = ref('')

const showDeleteModal = ref(false)
const tagToDelete = ref<{ _id: string; name: string } | null>(null)

onMounted(async () => {
  await tagStore.fetchTags()
})

function close() {
  emit('close')
}

async function createTag() {
  if (!newTag.value.trim()) return
  try {
    await tagStore.createTag({ name: newTag.value })
    newTag.value = ''
  } catch (err) {
    console.error("Impossible de créer l'étiquette", err)
  }
}

function confirmDelete(tag: { _id: string; name: string }) {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

async function deleteConfirmed() {
  if (!tagToDelete.value) return
  try {
    await tagStore.deleteTag(tagToDelete.value._id)
  } catch (err) {
    console.error("Impossible de supprimer l'étiquette", err)
    toast.error(t('form.tag.deleteError'))
  } finally {
    showDeleteModal.value = false
    tagToDelete.value = null
  }
}
</script>

<style scoped lang="scss">
.tag-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.tag-modal-box {
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

.tag-list {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.tag-item {
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

.tag-item-delete {
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

.tag-form {
  display: flex;
  gap: 8px;
}

.tag-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
</style>
