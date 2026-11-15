<template>
  <div ref="root" class="gallery" :class="{ 'is-fullscreen': isFullscreen }">
    <header class="gallery-top">
      <span v-if="slides.length" class="gallery-counter">
        {{ index + 1 }} / {{ slides.length }}<span v-if="loadingMore">…</span>
      </span>
      <div class="gallery-top-actions">
        <button
          type="button"
          class="gallery-icon-btn"
          :title="isFullscreen ? $t('gallery.exitFullscreen') : $t('gallery.fullscreen')"
          :aria-label="isFullscreen ? $t('gallery.exitFullscreen') : $t('gallery.fullscreen')"
          @click="toggleFullscreen"
        >
          <ArrowsPointingInIcon v-if="isFullscreen" />
          <ArrowsPointingOutIcon v-else />
        </button>
        <router-link to="/" class="gallery-icon-btn" :title="$t('gallery.close')" :aria-label="$t('gallery.close')">
          <XMarkIcon />
        </router-link>
      </div>
    </header>

    <div v-if="loading" class="gallery-status">{{ $t('gallery.loading') }}</div>
    <div v-else-if="!current" class="gallery-status">{{ $t('gallery.empty') }}</div>
    <template v-else>
      <div class="gallery-stage" @pointerdown="onPointerDown" @pointerup="onPointerUp">
        <Transition name="gallery-fade" mode="out-in">
          <img
            :key="current.key"
            :src="imgUrl(current.image)"
            :alt="current.title"
            class="gallery-image"
            draggable="false"
          />
        </Transition>
      </div>

      <button
        type="button"
        class="gallery-nav gallery-nav--prev"
        :title="$t('gallery.prev')"
        :aria-label="$t('gallery.prev')"
        @click="prev"
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        class="gallery-nav gallery-nav--next"
        :title="$t('gallery.next')"
        :aria-label="$t('gallery.next')"
        @click="next"
      >
        <ChevronRightIcon />
      </button>

      <footer class="gallery-caption">
        <h2 class="gallery-title">{{ current.title }}</h2>
        <p v-if="current.filmmaker || current.year" class="gallery-meta">
          {{ [current.filmmaker, current.year].filter(Boolean).join(' · ') }}
        </p>
        <p class="gallery-sizes">
          <router-link
            v-for="v in current.variants"
            :key="v._id"
            :to="{ name: 'posters', params: { id: v._id } }"
            class="gallery-size"
            :class="{ 'is-sold-out': v.soldOut }"
          >
            {{ v.size }} · {{ v.price }} €<span v-if="v.soldOut"> · {{ $t('gallery.soldOut') }}</span>
          </router-link>
        </p>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import api from '@/utils/axios'
import type { Poster } from '@/types/models'

// One slide per film: the sizes of the same title share one image.
interface Slide {
  key: string
  title: string
  image: string
  filmmaker?: string
  year?: number
  variants: { _id: string; size: string; price: number; soldOut: boolean }[]
}

const PAGE_SIZE = 60

const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement | null>(null)
const slides = ref<Slide[]>([])
const index = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const isFullscreen = ref(false)
let unmounted = false

const current = computed<Slide | undefined>(() => slides.value[index.value])

const imgUrl = (image: string) => import.meta.env.VITE_IMG_URL + image

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function addPosters(posters: Poster[]) {
  for (const p of posters) {
    const variant = {
      _id: p._id,
      size: p.size,
      price: p.price,
      soldOut: p.stockInfo?.availableStock === 0,
    }
    const last = slides.value[slides.value.length - 1]
    // Titles arrive sorted, so sizes of the same film are next to each other
    if (last && normalize(last.title) === normalize(p.title)) {
      last.variants.push(variant)
    } else {
      slides.value.push({
        key: p._id,
        title: p.title,
        image: p.image,
        filmmaker: p.filmmaker,
        year: p.year,
        variants: [variant],
      })
    }
  }
}

async function fetchPage(page: number) {
  const res = await api.get('/posters', {
    params: { forSale: true, hasImage: true, sort: 'title', page, limit: PAGE_SIZE },
  })
  return res.data as { data: Poster[]; pages: number }
}

// Open on the poster named in the URL (?poster=<id>) once it has loaded
const wantedId = typeof route.query.poster === 'string' ? route.query.poster : ''
function jumpToWanted() {
  if (!wantedId) return true
  const i = slides.value.findIndex((s) => s.variants.some((v) => v._id === wantedId))
  if (i === -1) return false
  index.value = i
  return true
}

async function loadAll() {
  try {
    const first = await fetchPage(1)
    addPosters(first.data)
    let found = jumpToWanted()
    loading.value = false
    loadingMore.value = first.pages > 1
    for (let page = 2; page <= first.pages && !unmounted; page++) {
      addPosters((await fetchPage(page)).data)
      if (!found) found = jumpToWanted()
    }
  } catch (err) {
    console.error('Failed to load gallery', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function next() {
  if (slides.value.length) index.value = (index.value + 1) % slides.value.length
}

function prev() {
  if (slides.value.length) index.value = (index.value - 1 + slides.value.length) % slides.value.length
}

// Keep the current poster in the URL and preload its neighbours
watch(current, (slide) => {
  if (!slide) return
  router.replace({ query: { poster: slide.variants[0]?._id } })
  for (const offset of [1, -1]) {
    const n = slides.value.length
    const neighbour = slides.value[(index.value + offset + n) % n]
    if (neighbour) new Image().src = imgUrl(neighbour.image)
  }
})

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await root.value?.requestFullscreen()
  } catch (err) {
    console.error('Fullscreen not available', err)
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'Escape' && !document.fullscreenElement) router.push('/')
}

// Swipe left/right on touch screens (and mouse drag)
let pointerStartX: number | null = null
function onPointerDown(e: PointerEvent) {
  pointerStartX = e.clientX
}
function onPointerUp(e: PointerEvent) {
  if (pointerStartX === null) return
  const dx = e.clientX - pointerStartX
  pointerStartX = null
  if (dx > 50) prev()
  else if (dx < -50) next()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  loadAll()
})

onBeforeUnmount(() => {
  unmounted = true
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<style scoped lang="scss">
.gallery {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: #111;
  color: white;
  user-select: none;
}

.gallery-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-weight: 600;
}

.gallery-counter {
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}

.gallery-top-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.gallery-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

.gallery-status {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.gallery-stage {
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5.5rem;
  touch-action: pan-y;
}

.gallery-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  cursor: pointer;
  transition: background 0.15s;

  svg {
    width: 2.25rem;
    height: 2.25rem;
  }

  &:hover {
    background: $red;
  }

  &--prev {
    left: 1rem;
  }

  &--next {
    right: 1rem;
  }
}

.gallery-caption {
  padding: 0.75rem 1rem 1rem;
  text-align: center;
}

.gallery-title {
  margin: 0;
  font-size: 1.4rem;
}

.gallery-meta {
  margin: 0.25rem 0 0;
  opacity: 0.75;
}

.gallery-sizes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.6rem 0 0;
}

.gallery-size {
  padding: 0.2rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  color: white;
  text-decoration: none;
  font-size: 0.95rem;

  &:hover {
    background: $red;
    border-color: $red;
  }

  &.is-sold-out {
    opacity: 0.55;
  }
}

/* In full-screen mode the poster takes as much room as possible */
.gallery.is-fullscreen {
  .gallery-caption {
    padding-top: 0.25rem;
  }

  .gallery-meta {
    display: none;
  }
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.2s ease;
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: $break-sm) {
  .gallery-stage {
    padding: 0 0.5rem;
  }

  .gallery-nav {
    width: 2.75rem;
    height: 2.75rem;
    background: rgba(0, 0, 0, 0.45);

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    &--prev {
      left: 0.5rem;
    }

    &--next {
      right: 0.5rem;
    }
  }

  .gallery-title {
    font-size: 1.1rem;
  }
}
</style>
