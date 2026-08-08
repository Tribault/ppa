<template>
  <div class="chip-input-wrapper">
    <div class="chip-input-chips" @click="focusInput">
      <span v-for="id in model" :key="id" class="chip-input-chip">
        {{ nameFor(id) }}
        <button type="button" class="chip-input-chip-remove" @click.stop="removeChip(id)">
          <x-mark-icon />
        </button>
      </span>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        :placeholder="model.length ? '' : placeholder"
        class="chip-input-text"
        @keydown.enter.prevent="addFirstSuggestion"
        @keydown.esc="showSuggestions = false"
        @focus="showSuggestions = true"
        @input="showSuggestions = true"
        @blur="showSuggestions = false"
      />
    </div>
    <ul v-if="showSuggestions && filteredSuggestions.length" class="chip-input-suggestions">
      <li v-for="option in filteredSuggestions" :key="option._id" @mousedown.prevent="addChip(option._id)">
        {{ option.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  options: { _id: string; name: string }[]
  placeholder?: string
}>()

const model = defineModel<string[]>({ default: () => [] })

const query = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const showSuggestions = ref(false)

function nameFor(id: string) {
  return props.options.find((option) => option._id === id)?.name || ''
}

const filteredSuggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.options.filter(
    (option) => !model.value.includes(option._id) && (!q || option.name.toLowerCase().includes(q)),
  )
})

function addChip(id: string) {
  if (!model.value.includes(id)) {
    model.value = [...model.value, id]
  }
  query.value = ''
  showSuggestions.value = false
  inputEl.value?.focus()
}

function removeChip(id: string) {
  model.value = model.value.filter((existing) => existing !== id)
}

function addFirstSuggestion() {
  if (filteredSuggestions.value.length) {
    addChip(filteredSuggestions.value[0]._id)
  }
}

function focusInput() {
  inputEl.value?.focus()
}
</script>

<style scoped lang="scss">
.chip-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 90%;
}

.chip-input-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: white;
  cursor: text;
}

.chip-input-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: $red;
  color: white;
  border-radius: 999px;
  padding: 3px 6px 3px 10px;
  font-size: 13px;
  white-space: nowrap;
}

.chip-input-chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;

  svg {
    width: 12px;
    height: 12px;
  }
}

.chip-input-text {
  border: none;
  outline: none;
  flex: 1;
  min-width: 80px;
  font-size: 14px;
  padding: 2px;
  color: $darker-red;
}

.chip-input-suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;
  background: white;
  color: $darker-red;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-height: 160px;
  overflow-y: auto;
  list-style: none;
  padding: 4px 0;
  margin: 0;

  li {
    padding: 6px 10px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: rgba(220, 20, 60, 0.1);
    }
  }
}

@media (max-width: $break-sm) {
  .chip-input-wrapper {
    max-width: 100%;
    width: 100%;
  }
}
</style>
