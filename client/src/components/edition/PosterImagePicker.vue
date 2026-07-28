<template>
  <div v-if="visible" class="poster-picker-overlay" @click="close">
    <div class="poster-picker-box" @click.stop>
      <button class="close-btn" @click="close"><x-mark-icon /></button>
      <h2>{{ $t('form.poster.suggestedPosters') }}</h2>

      <div class="poster-picker-grid">
        <button
          v-for="(option, i) in options"
          :key="i"
          type="button"
          class="poster-picker-option"
          :class="{ selected: selectedPath === option.path }"
          :disabled="loading"
          @click="$emit('select', option)"
        >
          <img :src="option.previewUrl" alt="" />
          <em v-if="option.language">{{ option.language }}</em>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TmdbPosterOption } from '@/types/models'
import { XMarkIcon } from '@heroicons/vue/24/solid'

defineProps<{
  visible: boolean
  options: TmdbPosterOption[]
  selectedPath: string | null
  loading: boolean
}>()
const emit = defineEmits(['close', 'select'])

function close() {
  emit('close')
}
</script>

<style scoped lang="scss">
.poster-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.poster-picker-box {
  background: $darker-red;
  color: white;
  padding: 20px;
  border-radius: 12px;
  width: 700px;
  max-width: 95%;
  max-height: 85vh;
  overflow-y: auto;
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
  cursor: pointer;
  padding: 4px;
  display: inline-flex;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

h2 {
  font-size: 16px;
  margin: 0 24px 16px 0;
}

.poster-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.poster-picker-option {
  position: relative;
  padding: 0;
  border: 3px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  line-height: 0;

  &.selected {
    border-color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.5);
  }

  img {
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 4px;
  }

  em {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 10px;
    padding: 2px 5px;
    border-radius: 3px;
  }
}
</style>
