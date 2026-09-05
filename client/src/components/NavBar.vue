<template>
  <nav class="navbar">
    <div class="navbar-home">
      <router-link class="navbar-home__link" to="/"><img src="@/assets/logo.png" /></router-link>
    </div>
    <div v-if="!auth.user" class="navbar-options">
      <router-link to="/login">{{ $t('nav.loginSignup') }}</router-link>
    </div>
    <div v-else class="navbar-options">
      <router-link v-if="auth.user.role === 'admin' && $route.path !== '/admin'" to="/admin">{{ $t('nav.admin')
        }}</router-link>
      <router-link v-if="auth.user.role === 'user'" to="/account">{{ $t('nav.myBookings') }}</router-link>
      <div class="navbar-options__user">
        <span class="navbar-home__logout--user">{{ auth.user.email }}</span>
        <button @click="logout" class="navbar-home__logout" :title="$t('nav.logoutTitle')">
          {{ $t('nav.logout') }}
        </button>
      </div>
    </div>
    <button
      v-if="auth.user?.role === 'user'"
      class="navbar-basket"
      :title="$t('nav.viewBasket')"
      :aria-label="$t('nav.viewBasket')"
      @click="basketStore.open()"
    >
      <ShoppingBagIcon />
      <span v-if="basketStore.itemCount" class="navbar-basket__badge">{{ basketStore.itemCount }}</span>
    </button>
    <router-link to="/help" class="navbar-help" :title="$t('nav.help')" :aria-label="$t('nav.help')">
      <QuestionMarkCircleIcon />
    </router-link>
  </nav>
  <basket-modal />
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useBasketStore } from '../stores/basket'
import { useRouter } from 'vue-router'
import { QuestionMarkCircleIcon, ShoppingBagIcon } from '@heroicons/vue/24/solid'
import BasketModal from '@/components/cards/BasketModal.vue'

const auth = useAuthStore()
const basketStore = useBasketStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  basketStore.clear()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  color: whitesmoke;
  font: $font-size-lg $font-base;
  font-weight: 700;
  gap: 1rem;
  padding: 1rem;
  background-color: $red;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
}

.navbar-home__link>img {
  max-height: 120px;
}

.navbar-home__logout {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

.navbar-home__logout--user {
  font-weight: 700;
}

.navbar-basket {
  position: relative;
  display: inline-flex;
  background: none;
  border: none;
  padding: 0;
  color: whitesmoke;
  flex-shrink: 0;
  cursor: pointer;

  svg {
    width: 2.25rem;
    height: 2.25rem;
  }

  &:hover {
    color: white;
  }

  &__badge {
    position: absolute;
    top: -4px;
    right: -6px;
    background-color: white;
    color: $red;
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
    border-radius: 999px;
    padding: 3px 6px;
    min-width: 1.2em;
    text-align: center;
  }
}

.navbar-help {
  display: inline-flex;
  color: whitesmoke;
  flex-shrink: 0;

  svg {
    width: 2.25rem;
    height: 2.25rem;
  }

  &:hover {
    color: white;
  }
}

.navbar-options__user {
  display: flex;
  flex-direction: column;
  justify-self: flex-end;
}

.navbar-options {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  word-break: break-all;
}

@media screen and (max-width: $break-sm) {
  .navbar-home {
    flex-grow: 1;
    text-align: center;
  }

  .navbar {
    flex-wrap: wrap;
    font-size: 1rem;
  }
}
</style>
