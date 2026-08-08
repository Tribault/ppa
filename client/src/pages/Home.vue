<template>
  <div class="home-container">
    <div class="home-announcement">
      <div class="home-announcement-wrapper">
        <ChatBubbleLeftIcon />
        <div
          class="tag-red"
          v-if="messageStore.message?.content"
          v-html="messageStore.message.content"
        />
      </div>
    </div>

    <div class="home-header">
      <div class="home-search">
        <MagnifyingGlassIcon class="icon" />
        <input type="text" :placeholder="$t('home.searchPlaceholder')" @input="onSearchInput" />
      </div>
      <div class="home-browse">
        <select v-model="browseMode" class="home-browse-select">
          <option value="new">{{ $t('home.browseNew') }}</option>
          <option value="all">{{ $t('home.browseAll') }}</option>
          <option value="country">{{ $t('home.browseCountry') }}</option>
          <option value="genre">{{ $t('home.browseGenre') }}</option>
          <option value="tag">{{ $t('home.browseTag') }}</option>
        </select>
        <select
          v-if="browseMode === 'country'"
          v-model="selectedCountry"
          class="home-browse-select"
          @change="loadPosters(1)"
        >
          <option v-for="c in posterStore.countries" :key="c" :value="c">{{ c }}</option>
        </select>
        <select
          v-if="browseMode === 'genre'"
          v-model="selectedGenre"
          class="home-browse-select"
          @change="loadPosters(1)"
        >
          <option v-for="g in posterStore.genres" :key="g" :value="g">{{ g }}</option>
        </select>
        <select
          v-if="browseMode === 'tag'"
          v-model="selectedTagId"
          class="home-browse-select"
          @change="loadPosters(1)"
        >
          <option v-for="t in tagStore.tags" :key="t._id" :value="t._id">{{ t.name }}</option>
        </select>
      </div>
      <div class="home-view-toggle">
        <button @click="view = 'grid'" :class="{ active: view === 'grid' }" :title="$t('home.gridView')">
          <Squares2X2Icon class="icon" />
        </button>
        <button @click="view = 'list'" :class="{ active: view === 'list' }" :title="$t('home.listView')">
          <ListBulletIcon class="icon" />
        </button>
      </div>
    </div>
    <div class="home-error" v-if="loading">
      <Spinner />
    </div>
    <div class="home-error" v-else-if="posterStore.filteredPosters.length == 0 && !loading">
      <img src="@/assets/404.svg" />
      <p>{{ $t('home.noResults') }}</p>
    </div>

    <div v-else class="home-content">
      <transition name="fade" mode="out-in">
        <div v-if="view === 'grid'" key="grid" class="grid-container">
          <home-poster-card
            v-for="p in posterStore.filteredPosters"
            :key="p._id"
            :poster="p"
            :view="view"
            @details="posterDetails(p._id)"
            @booked="onBooked"
          />
        </div>

        <div v-else key="list" class="list-container">
          <home-poster-card
            v-for="p in posterStore.filteredPosters"
            :key="p._id"
            :poster="p"
            :view="view"
            @details="posterDetails(p._id)"
            @booked="onBooked"
          />
        </div>
      </transition>

      <div v-if="showMoreVisible" class="home-show-more">
        <button class="btn-red-bg" @click="showMore">{{ $t('home.showMore') }}</button>
      </div>

      <pagination v-if="!isCompactPreview" :page="posterStore.page" :pages="posterStore.pages" @change="loadPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { useTagStore } from '@/stores/tags'
import { useMessageStore } from '@/stores/messages'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/vue/24/outline'
import HomePosterCard from '@/components/cards/HomePosterCard.vue'
import Spinner from '@/components/utils/Spinner.vue'
import Pagination from '@/components/utils/Pagination.vue'

const router = useRouter()

const posterStore = usePosterStore()
const tagStore = useTagStore()
const messageStore = useMessageStore()
const loading = ref(true)

const view = ref<'grid' | 'list'>((localStorage.getItem('posterView') as 'grid' | 'list') || 'grid')
const limit = computed(() => view.value === 'list' ? 30 : 10)

const PREVIEW_LIMIT = 12

type BrowseMode = 'new' | 'all' | 'country' | 'genre' | 'tag'
const browseMode = ref<BrowseMode>('new')
const selectedCountry = ref('')
const selectedGenre = ref('')
const selectedTagId = ref('')
const expanded = ref(false)

const isPreview = computed(
  () => view.value === 'grid' && browseMode.value === 'new' && !expanded.value && !posterStore.searchQuery,
)

const isCompactPreview = computed(() => isPreview.value && posterStore.total > PREVIEW_LIMIT)
const showMoreVisible = computed(() => isCompactPreview.value)

function onSearchInput(e: Event) {
  posterStore.setSearchQuery((e.target as HTMLInputElement).value)
}

function posterDetails(posterId: string) {
  router.push({ name: 'posters', params: { id: posterId } })
}

function loadPosters(page = 1) {
  const params: Parameters<typeof posterStore.fetchPosters>[0] = {
    forSale: true,
    page,
    limit: isPreview.value ? PREVIEW_LIMIT : limit.value,
    sort: browseMode.value === 'new' ? 'newest' : 'title',
    q: posterStore.searchQuery || undefined,
  }
  if (browseMode.value === 'country' && selectedCountry.value) params.country = selectedCountry.value
  if (browseMode.value === 'genre' && selectedGenre.value) params.genre = selectedGenre.value
  if (browseMode.value === 'tag' && selectedTagId.value) params.tags = selectedTagId.value
  return posterStore.fetchPosters(params)
}

function loadPage(p: number) {
  loadPosters(p)
}

function showMore() {
  expanded.value = true
  loadPosters(1)
}

function onBooked() {
  loadPosters(posterStore.page)
}

onMounted(async () => {
  await Promise.all([
    loadPosters(1),
    messageStore.fetchMessage(),
    posterStore.fetchFilters({ forSale: true }),
    tagStore.fetchTags(),
  ])
  loading.value = false
})

watch(view, () => {
  localStorage.setItem('posterView', view.value)
  loadPosters(1)
})

watch(() => posterStore.searchQuery, () => {
  loadPosters(1)
})

watch(browseMode, (mode) => {
  expanded.value = false
  selectedCountry.value = mode === 'country' ? posterStore.countries[0] || '' : ''
  selectedGenre.value = mode === 'genre' ? posterStore.genres[0] || '' : ''
  selectedTagId.value = mode === 'tag' ? tagStore.tags[0]?._id || '' : ''
  loadPosters(1)
})
</script>

<style lang="scss" scoped>
.home-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home-header {
  display: flex;
  justify-content: space-between;
  background-color: whitesmoke;
  color: $red;
  padding: $space-sm;
}

.home-search {
  display: flex;
  align-items: center;
  > input {
    margin-left: $space-sm;
    height: 30px;
  }
}

.home-browse {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-weight: 500;
}

.home-browse-select {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid $red;
  background: white;
  color: $red;
  font-weight: 500;
  font-size: 0.95rem;
}

.home-show-more {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.home-announcement {
  display: grid;
  min-width: 0;

  &-wrapper {
    color: $darker-red;
    font-weight: 500;
    margin: 0.5rem 0.5rem;
    display: flex;
    justify-content: center;
    width: auto;
    min-width: 0;

    .tag-red {
      min-width: 0;
      max-width: 100%;
      overflow-wrap: break-word;
      white-space: normal;
    }
  }

  svg {
    max-width: 40px;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
}

.home-error {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  font-size: $font-size-lg;
  img {
    max-width: 500px;
    width: 100%;
    object-fit: cover;
  }
}

.home-view-toggle {
  align-items: center;
  display: flex;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #aaa;
    background: white;
    cursor: pointer;
  }

  button.active {
    background-color: $red;
    text-decoration: underline;
    .icon {
      color: white;
    }
  }
}

.tag-red{
  align-content: center;
}

.icon {
  width: 24px;
  height: 24px;
  color: $red;
}

.view-toggle button.active .icon {
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.grid-container {
  flex: 1;
  display: grid;
  align-items: start;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
}

.home-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

@media screen and (max-width: $break-sm) {
  .home-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .home-browse {
    flex-wrap: wrap;
    justify-content: center;
  }
  .poster-card-grid{

  margin: 0 auto;
  }
}
</style>
