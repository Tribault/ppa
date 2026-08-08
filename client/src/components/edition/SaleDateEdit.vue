<template>
  <Transition name="fade">
    <div v-if="visible" class="sale-date-edit">
      <Transition name="popup">
        <div class="sale-date-edit-box" @click.stop>
          <button class="sale-date-edit-close-btn btn-white-bg" @click="close">
            <x-mark-icon />
          </button>

          <h2 class="sale-date-edit-title">{{ $t('form.saleDate.title') }}</h2>

          <form @submit.prevent="submit" class="sale-date-edit-form">
            <div class="sale-date-edit-form-row">
              <input v-model="draft" type="date" class="sale-date-edit-input" required />
            </div>

            <div class="sale-date-edit-form-actions">
              <button type="submit" class="btn-white-bg">
                {{ $t('form.saleDate.save') }} <folder-arrow-down-icon />
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
import { useSaleDateStore } from '@/stores/saleDate'
import { XMarkIcon, FolderArrowDownIcon } from '@heroicons/vue/24/solid'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
const toast = useToast()
const { t } = useI18n()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close', 'saved'])

const saleDateStore = useSaleDateStore()
const draft = ref('')

function close() {
  emit('close')
}

async function submit() {
  try {
    await saleDateStore.updateSaleDate(draft.value)
    toast.success(t('form.saleDate.updateSuccess'))
    emit('saved')
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('form.saleDate.error'))
  }
  close()
}

onMounted(async () => {
  await saleDateStore.fetchSaleDate()
  draft.value = saleDateStore.saleDate?.date ? saleDateStore.saleDate.date.slice(0, 10) : ''
})
</script>

<style scoped lang="scss">
.sale-date-edit {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
    max-width: 400px;
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

  &-form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
