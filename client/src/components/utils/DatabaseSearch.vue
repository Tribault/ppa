<template>
<div class="database-search" ref="dropdownRef">
    <input
      class="database-search-input"
      type="text"
      v-model="query"
      :placeholder="searchType == 'user' ? 'Email du client' : 'Poster'"
      @input="searchDebounce"
       @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="selectHighlighted"
    />
    <ul v-if="searchType == 'user' && showDropdown && userResults.length" class="database-search-dropdown">
      <li v-for=" (u, idx) in userResults" :key="u._id" @click="sendResult(u, u.email)"  :class="{ highlighted: idx === highlightedIndex }">
        {{ u.email }}
      </li>
    </ul>
        <ul v-if="searchType == 'poster' && showDropdown && posterResults.length" class="database-search-dropdown">
      <li v-for=" (p, idx) in posterResults" :key="p._id" @click="sendResult(p, p.title)"  :class="{ highlighted: idx === highlightedIndex }">
        {{ p.title }}
      </li>
    </ul>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import type {Poster, User} from "@/types/models"
import { usePosterStore } from "@/stores/posters"
import { useUserStore } from "@/stores/users"
import debounce from 'lodash.debounce'

const userStore = useUserStore()
const posterStore = usePosterStore()

const props = defineProps<{
  searchType: 'user' | 'poster'
}>()

const emit = defineEmits<{
  valueSelected: [id: string]
}>()

const query = ref("")
const userResults = ref<User[]>([])
const posterResults = ref<Poster[]>([])

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const searchDebounce = debounce(searchQuery,500)

const highlightedIndex = ref(-1)

async function searchQuery() {
    highlightedIndex.value = -1
  if(props.searchType == 'user'){
    await userStore.fetchUsers({ q: query.value })
    userResults.value = userStore.users
    showDropdown.value = !!userResults.value.length
  }
  else if(props.searchType == 'poster'){
    await posterStore.fetchPosters({ q: query.value })
     posterResults.value = posterStore.posters
     showDropdown.value = !!posterResults.value.length
  }

}

async function sendResult(item: User | Poster, displayText: string){
  emit('valueSelected', item._id)
  query.value = displayText
  showDropdown.value = false
  userResults.value = []
  posterResults.value = []
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

function moveHighlight(direction: number) {
  const list = props.searchType === "user" ? userResults.value : posterResults.value
  if (!list.length) return
  highlightedIndex.value =
    (highlightedIndex.value + direction + list.length) % list.length
}

function selectHighlighted() {
  const list = props.searchType === "user" ? userResults.value : posterResults.value
  if (highlightedIndex.value >= 0 && highlightedIndex.value < list.length) {
    const item = list[highlightedIndex.value]
    sendResult(item, "email" in item ? item.email : item.title)
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})


</script>

<style scoped>
.database-search {
  position: relative;
}

  .database-search-input{
  padding: 8px 10px;
  margin-left: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex-grow: 1;
  max-width: 90%;
  }

.database-search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;

  li {
  padding: 0;
  cursor: pointer;
  color:black;
  list-style: none;
}

li:hover, li.highlighted{
  background: #f0f0f0;
}
}
</style>
