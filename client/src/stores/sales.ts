import { defineStore } from 'pinia'
import type { Sale } from '@/types/models'
import api from '@/utils/axios'

export const useSaleStore = defineStore('sales', {
  state: () => ({
    sales: [] as Sale[],
    userSales: [] as Sale[],
    posterSales: [] as Sale[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchSales() {
      this.loading = true
      try {
        const res = await api.get('/sales')
        this.sales = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch sales'
      } finally {
        this.loading = false
      }
    },

    async fetchUserSales(id: string) {
      this.loading = true
      try {
        const res = await api.get(`/sales/user/${id}`)
        this.userSales = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch user sales'
      } finally {
        this.loading = false
      }
    
    },

    async fetchPosterSales(id: string) {
     this.loading = true
      try {
        const res = await api.get(`/sales/poster/${id}`)
        this.posterSales = res.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch poster sales'
      } finally {
        this.loading = false
      }
    },

    async exportSalesCSV(filters = {}){
      try {
    const params = new URLSearchParams(filters).toString();
    const url = `/sales/export/csv${params ? `?${params}` : ''}`;

    const res = await api.get(url);

    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'sales.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
  }
    }
  },
})
