<template class="poster-card">
  <div v-if="view === 'grid'" @click="emit('details')" class="poster-card-grid">
    <div v-if="poster.image" class="poster-card-poster">
      <img :src="imgUrl" alt="" />
      <div v-if="poster.tags.includes('vintage')" class="poster-card-badge">Collector</div>
    </div>
    <div v-else class="poster-card-poster no-logo"><EyeSlashIcon /></div>
    <div class="poster-card-info">
      <div class="poster-card-title">{{ poster.title }}</div>
      <div>{{ poster.price }} €</div>
    </div>
  </div>
  <div v-else @click="emit('details')" class="poster-card-list">
    <div class="poster-card-list--title">{{ poster.title }}</div>
    <div class="poster-card-list--tags" v-for="t in poster.tags">{{ t }}</div>
    <div>{{ poster.price }} €</div>
  </div>
</template>

<script setup lang="ts">
import type { Poster } from '@/types/models'
import { ref } from 'vue'
import { EyeSlashIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  poster: Poster
  view: 'grid' | 'list'
}>()

const emit = defineEmits(['details'])

const imgUrl = ref<string>(import.meta.env.VITE_IMG_URL + props.poster.image)
</script>

<style lang="scss" scoped>
.poster-card-list:nth-child(even) {
  background-color: $red;
  color: white;

  .poster-card-list--tags {
    background-color: white;
    color: $red;
  }
}

.poster-card-grid {
  width: 300px;
  height: 525px;
  background-color: $red;
  color: white;
  overflow: hidden;
  cursor: pointer;
}

.poster-card-list {
  width: 100%;
  height: 50px;
  display: flex;
  color: $red;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;

  &--title {
    font-weight: 900;
  }

  &--tags {
    background-color: rgba(220, 20, 60, 0.9);
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    text-transform: uppercase;
  }
}

.poster-card-poster {
  position: relative;
  width: 100%;
  & img {
    width: 100%;
    height: calc(width * (16 / 9));
    object-fit: cover;
    display: block;
  }
}

.poster-card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(220, 20, 60, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

.poster-card-info {
  padding-left: $space-sm;
}

.poster-card-title {
  font-weight: 700;
  font: $font-size-lg;
}

.icon {
  width: 14px;
  height: 14px;
  color: #333;
}

.no-logo {
  margin: 75px 0;
}

.card-list {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
  justify-content: space-between;
}
</style>
