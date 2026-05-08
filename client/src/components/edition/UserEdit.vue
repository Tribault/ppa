<template class="user-edit">
  <Transition name="user-edit-fade">
    <div v-if="visible" class="user-edit-overlay">
      <Transition name="user-edit-popup">
        <div class="user-edit-box" @click.stop>
          <button class="user-edit-close-btn btn-red-bg" @click="close"><x-mark-icon /></button>

          <h2 class="user-edit-title">
            {{ $t('form.user.editTitle') }}
          </h2>

          <form @submit.prevent="submit" class="user-edit-form">
            <div class="user-edit-form--row">
              <b>{{ $t('form.user.emailLabel') }}</b>
              <input
                v-model="form.email"
                type="text"
                :placeholder="$t('form.user.emailLabel')"
                class="user-edit-input"
              />
            </div>
            <div class="user-edit-form--row">
              <b>{{ $t('form.user.roleLabel') }}</b>
              <select v-model="form.role" class="user-edit-input">
                <option value="admin">{{ $t('form.user.roleAdmin') }}</option>
                <option value="user">{{ $t('form.user.roleUser') }}</option>
              </select>
            </div>

            <div class="user-edit-form--actions">
              <button type="submit" class="btn-red-bg">
                <b>{{ $t('form.user.save') }}</b> <folder-arrow-down-icon />
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
import type { User } from '@/types/models'
import { XMarkIcon, FolderArrowDownIcon } from '@heroicons/vue/24/solid'
import { useUserStore } from '@/stores/users'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
const toast = useToast()
const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  userToEdit?: User
}>()
const emit = defineEmits(['close', 'saved'])
const userStore = useUserStore()

const form = ref<{
  email: string
  role: 'user' | 'admin'
}>({
  email: '',
  role: 'user',
})

onMounted(async () => {
  await userStore.fetchUsers()
})

watch(
  () => props.userToEdit,
  (val) => {
    if (val) {
      form.value = {
        email: val.email,
        role: val.role,
      }
    } else {
      form.value = { email: '', role: 'user' }
    }
  },
  { immediate: true },
)

function close() {
  emit('close')
}

async function submit() {
  try {
    if (props.userToEdit) {
      await userStore.updateUser(props.userToEdit._id, form.value)
      toast.success(t('form.user.updateSuccess'))
      emit('saved')
      close()
    }
  } catch (err) {
    console.error(err)
    toast.error(t('form.user.updateError'))
  }
}
</script>

<style scoped lang="scss">
.user-edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-edit-box {
  background: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.user-edit-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
}

.user-edit-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}

.user-edit-form {
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

.user-edit-input {
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
.user-edit-fade-enter-active,
.user-edit-fade-leave-active {
  transition: opacity 0.25s ease;
}
.user-edit-fade-enter-from,
.user-edit-fade-leave-to {
  opacity: 0;
}

.user-edit-popup-enter-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.user-edit-popup-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.user-edit-popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
