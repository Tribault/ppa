import { defineStore } from 'pinia'
import type { User } from '@/types/models'
import { ref, computed } from 'vue'
import api from '@/utils/axios'
import debounce from 'lodash.debounce'
import { useToast } from 'vue-toastification'
const toast = useToast()

export const useUserStore = defineStore('users', () => {

    const users = ref<User[]>([])
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const selectedLetter = ref<string | null>(null)
    const searchQuery = ref('')


    const setSearchQuery = debounce((value: string) => {
        searchQuery.value = value
      }, 300)
    
      const filteredUsers = computed(() => {
        let result = users.value
    
        if (selectedLetter.value) {
          result = result.filter(
            (u) => u.email[0].toUpperCase() === selectedLetter.value?.toUpperCase(),
          )
        }
    
        if (searchQuery.value.trim()) {
          const query = searchQuery.value.toLowerCase()
          result = result.filter(
            (u) =>
              u.email.toLowerCase().includes(query)
          )
        }
    
        return result
      })


    async function fetchUsers(params? : Record<string, string>) {
      loading.value = true
      try {
        const res = await api.get('/users', {params})
        users.value = res.data
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to fetch users'
      } finally {
        loading.value = false
      }
    }

    async function fetchUser(id: string) {
      loading.value = true
      try {
        const res = await api.get(`/users/${id}`)
        user.value = res.data
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to fetch user'
      } finally {
        loading.value = false
      }
    }

    async function createUser(userData: Partial<User>) {
      try {
        const res = await api.post('/users', userData)
        users.value.push(res.data)
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to create user'
        throw err
      }
    }

    async function updateUser(id: string, userData: Partial<User>) {
      try {
        const res = await api.put(`/users/${id}`, userData)
        const index = users.value.findIndex((u) => u._id === id)
        if (index !== -1) {
          users.value[index] = res.data
        }
        toast.success('Utilisateur mis à jour ✅')
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to update user'
        toast.error('Erreur durant la mise à jour ❌')
        throw err
      }
    }

    async function deleteUser(id: string) {
      try {
        await api.delete(`/users/${id}`)
        users.value = users.value.filter((u) => u._id !== id)
        toast.success('Utilisateur supprimé ✅')
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to delete user'
        toast.error('Erreur durant la suppression ❌')
        throw err
      }
    }

  return{
    users,
    user,
    error,
    loading,
    selectedLetter,
    searchQuery,
        setSearchQuery,
        filteredUsers,
    fetchUsers,
    fetchUser,
    updateUser,
    createUser,
    deleteUser

  }
})
