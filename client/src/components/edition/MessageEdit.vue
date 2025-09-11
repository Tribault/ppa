<template>
  <Transition name="fade">
    <div v-if="visible" class="message-edit">
      <Transition name="popup">
        <div class="message-edit-box" @click.stop>
          <button class="message-edit-close-btn btn-white-bg" @click="close">
            <x-mark-icon />
          </button>

          <h2 class="message-edit-title">Modifier le message</h2>

          <form @submit.prevent="submit" class="message-edit-form">
            <div class="message-edit-form-row">
              <textarea
                v-model="draft"
                placeholder="Tapez votre message en markdown..."
                rows="8"
                class="message-edit-input"
              />
            </div>

            <div class="message-edit-preview">
              <h3>Prévisualisation</h3>
              <div v-html="renderMarkdown(draft)" />
            </div>

            <div class="message-edit-form-actions">
              <button type="submit" class="btn-white-bg">
                Sauvegarder <folder-arrow-down-icon />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { marked } from 'marked'
import { useMessageStore } from '@/stores/messages'
import { XMarkIcon, FolderArrowDownIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close', 'saved'])

const messageStore = useMessageStore()
const draft = ref(messageStore.message || "")

function renderMarkdown(md: string) {
  return marked(md)
}

function close() {
  emit('close')
}

async function submit() {
  await messageStore.updateMessage(draft.value)
  emit('saved')
  close()
}

onMounted(async()=> {
    await messageStore.fetchMessage()
    draft.value = messageStore.message
})
</script>

<style scoped lang="scss">
.message-edit {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  &-box {
  background: white;
  color: $red;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  position: relative;
}

&-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
}

&-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

&-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

&-input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
}

&-preview {
  border-top: 1px solid #ddd;
  padding-top: 12px;
  font-size: 14px;
}

&-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

}






</style>
