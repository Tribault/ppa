<template>
    <tr class="border-t">
    <td
      v-for="column in columns"
      :key="column.key"
      class="px-4 py-2 whitespace-nowrap text-sm"
    >
      {{ resolve(booking, column.key) }}
    </td>
    <td><button>-</button><button>+</button><button>Modifier</button><button>Supprimer</button></td>
  </tr>
    </template>

    <script setup lang="ts">
    import type { Booking } from '@/types/models';
    const props = defineProps<{booking: Booking,  columns: { key: string; label: string }[];}>()

    function resolve(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

    </script>
<style>
.container-booking{
    display: flex;
    justify-content: space-between;
    padding: 2rem;
}
</style>