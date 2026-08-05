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
      <div class="home-filter">
        <button
          v-for="l in letters"
          :class="{ active: posterStore.selectedLetter === l }"
          class="btn"
          :key="l"
          @click="posterStore.selectedLetter = posterStore.selectedLetter == null ? l : null"
        >
          {{ l }}
        </button>
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
      <pagination :page="posterStore.page" :pages="posterStore.pages" @change="loadPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosterStore } from '@/stores/posters'
import { useMessageStore } from '@/stores/messages'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/vue/24/outline'
import { Alphabet } from '@/types/models'
import HomePosterCard from '@/components/cards/HomePosterCard.vue'
import Spinner from '@/components/utils/Spinner.vue'
import Pagination from '@/components/utils/Pagination.vue'

const router = useRouter()

const posterStore = usePosterStore()
const messageStore = useMessageStore()
const letters = Object.values(Alphabet)
const loading = ref(true)

const view = ref<'grid' | 'list'>((localStorage.getItem('posterView') as 'grid' | 'list') || 'grid')
const limit = computed(() => view.value === 'list' ? 30 : 10)

function onSearchInput(e: Event) {
  posterStore.setSearchQuery((e.target as HTMLInputElement).value)
}

function posterDetails(posterId: string) {
  router.push({ name: 'posters', params: { id: posterId } })
}

function loadPage(p: number) {
  posterStore.fetchPosters({ forSale: true, page: p, limit: limit.value })
}

function onBooked() {
  loadPage(posterStore.page)
}

onMounted(async () => {
  await posterStore.fetchPosters({ forSale: true, page: 1, limit: limit.value })
  await messageStore.fetchMessage()
  loading.value = false
})

watch(view, (newView) => {
  localStorage.setItem('posterView', newView)
  posterStore.fetchPosters({ forSale: true, page: 1, limit: limit.value })
})

watch(() => posterStore.searchQuery, (q) => {
  posterStore.fetchPosters({ forSale: true, page: 1, limit: limit.value, q: q || undefined })
})

watch(() => posterStore.selectedLetter, (letter) => {
  posterStore.fetchPosters({ forSale: true, page: 1, limit: limit.value, q: letter ? `^${letter}` : undefined })
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

.home-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-weight: 500;

  button.active {
    border: solid 1px;
    background-color: $red;
    color: white;
  }
}

.home-announcement {
  display: grid;

  &-wrapper {
    color: $darker-red;
    font-weight: 500;
    margin: 0.5rem 0.5rem;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  svg {
    max-width: 40px;
    margin-right: 0.5rem;
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
  }
  .home-filter {
    flex-wrap: wrap;
    justify-content: center;
  }
  .poster-card-grid{

  margin: 0 auto;
  }
}
</style>
