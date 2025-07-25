import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import Admin from '../pages/Admin.vue'
import PosterForm from '../pages/PosterForm.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/admin', component: Admin },
  { path: '/admin/new', component: PosterForm },
  { path: '/admin/edit/:id', component: PosterForm, props: true }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
