<template>
  <form @submit.prevent="submitForm">
    <input v-model="title" placeholder="Title" />
    <textarea v-model="description" placeholder="Description" />
    <input type="file" @change="onFileChange" />
    <button>Submit</button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const title = ref('');
const description = ref('');
const file = ref<File | null>(null);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    const res = await axios.get('http://localhost:5000/api/posters');
    const poster = res.data.find((p: any) => p._id === id);
    title.value = poster.title;
    description.value = poster.description;
  }
});

const submitForm = async () => {
  const id = route.params.id as string;
  const headers = { Authorization: `Bearer ${auth.token}` };

  if (id) {
    await axios.put(`http://localhost:5000/api/posters/${id}`, {
      title: title.value,
      description: description.value
    }, { headers });
  } else {
    const formData = new FormData();
    formData.append('title', title.value);
    formData.append('description', description.value);
    if (file.value) formData.append('image', file.value);

    await axios.post('http://localhost:5000/api/posters', formData, { headers });
  }

  router.push('/admin');
};
</script>
