<template>
  <div class="admin-tab">
  <div class="admin-users-header">
    <div class="admin-users-header--search">
      <MagnifyingGlassIcon class="icon" />
      <input type="text" placeholder="Chercher utilisateur..." @input="onSearchInput" />
    </div>
    <div class="admin-users-header--filter">
      <button
        v-for="l in letters"
        :class="{ active: userStore.selectedLetter === l }"
        class="btn"
        :key="l"
        @click="userStore.selectedLetter = userStore.selectedLetter == null ? l : null"
      >
        {{ l }}
      </button>
    </div>
  </div>

  <div class="admin-table-wrapper">
    <user-table
      :users="userStore.filteredUsers"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @sort="handleSort"
      @edit="(u) => openEditUser(u)"
      @delete="(u) => deleteUser(u)"
    />
  </div>
  <pagination :page="userStore.page" :pages="userStore.pages" @change="loadPage" />
  <user-edit
    v-if="editingUser"
    :visible="showModal"
    :userToEdit="editingUser"
    @close="closeModal"
    @saved="fetchList(1)"
  />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/users'
import { ref, onMounted, watch } from 'vue'
import { Alphabet } from '@/types/models'
import type { User } from '@/types/models'
import UserTable from '@/components/tables/UserTable.vue'
import UserEdit from '@/components/edition/UserEdit.vue'
import Pagination from '@/components/utils/Pagination.vue'

import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

const userStore = useUserStore()

const letters = Object.values(Alphabet)

const showModal = ref(false)

const editingUser = ref<User>()

const openEditUser = (user: User) => {
  editingUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

function activeQuery() {
  if (userStore.selectedLetter) return `^${userStore.selectedLetter}`
  if (userStore.searchQuery) return userStore.searchQuery
  return undefined
}

const sortBy = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function fetchList(page = userStore.page) {
  return userStore.fetchUsers({
    page,
    limit: 20,
    q: activeQuery(),
    sortBy: sortBy.value || undefined,
    sortDir: sortDir.value,
  })
}

function handleSort(field: string) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
  fetchList(1)
}

function loadPage(p: number) {
  fetchList(p)
}

onMounted(async () => {
  fetchList(1)
})

function onSearchInput(e: Event) {
  userStore.setSearchQuery((e.target as HTMLInputElement).value)
}

function deleteUser(userId: string) {
  userStore.deleteUser(userId)
}

watch(() => userStore.selectedLetter, () => {
  fetchList(1)
})

watch(() => userStore.searchQuery, () => {
  fetchList(1)
})
</script>

<style scoped lang="scss">
.admin-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-table-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.admin-users-header {
  background-color: $red;
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  gap: 0.5rem;

  padding: 0.5rem 1rem;
  > * {
    font-weight: 700;
  }

  @media screen and (min-width: $break-md) {
    grid-template-columns: 0.5fr 3fr auto;
  }
  svg {
    margin-right: 0.5rem;
  }

  &--search {
    display: flex;
    align-items: center;
    > input {
      margin-left: $space-sm;
      height: 30px;
    }
    svg {
      color: white;
    }
  }

  &--actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    button span {
      display: inline-flex;
      align-items: center;
    }
  }

  &--filter {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-weight: 500;
    color: white;

    button.active {
      border: solid 1px;
      background-color: white;
      color: $red;
    }
  }
}

.new-admin-users {
  text-align: end;
}
.container-home {
  padding: 0 1rem;
}

.header-home {
  display: flex;
  justify-content: space-between;
}
.view-toggle {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}
.view-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid #aaa;
  background: white;
  cursor: pointer;
}
.view-toggle button.active {
  background-color: #007bff;
  color: white;
}

.icon {
  width: 24px;
  height: 24px;
  color: #333;
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
</style>
