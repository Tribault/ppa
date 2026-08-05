<template>
  <div class="password-input">
    <input
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :required="required"
    />
    <button
      type="button"
      class="password-input-toggle"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      @click="visible = !visible"
    >
      <EyeSlashIcon v-if="visible" />
      <EyeIcon v-else />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'

defineProps<{
  placeholder?: string
  required?: boolean
}>()

const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<style scoped lang="scss">
.password-input {
  position: relative;
  display: inline-block;

  input {
    padding-right: 2.25rem;
  }
}

.password-input-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  // Sits on top of the input's own (usually white) background, not the
  // surrounding page — so it needs its own color rather than inheriting
  // the page's text color (which can make it invisible, e.g. white-on-white).
  color: #555;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 1.1rem;
    height: 1.1rem;
  }
}
</style>
