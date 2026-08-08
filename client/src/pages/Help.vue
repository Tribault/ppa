<template>
  <div class="help">
    <div class="help-image"><img src="@/assets/help.png" alt="" /></div>
    <div class="help-box">

      <template v-if="auth.isAdmin">
        <div v-html="$t('help.adminContent')" />
      </template>
      <template v-else>
        <p>
          {{ $t('help.paragraphUser1') }}
          {{ $t('help.paragraphUser2') }}
          {{ $t('help.paragraphUser3') }}
        </p>
        <h2>{{ $t('help.howto') }}</h2>

        <ul>
          <li>{{ $t('help.tickUser1') }}</li>
          <li>{{ $t('help.tickUser2') }}</li>
          <li>{{ $t('help.tickUser3') }}</li>
          <li>{{ $t('help.tickUser4') }}</li>
          <li>{{ $t('help.tickUser5') }}</li>
          <li>{{ $t('help.tickUser6') }}</li>
          <li>{{ $t('help.tickUser7') }}</li>
          <li>{{ $t('help.tickUser8') }}</li>
        </ul>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style scoped lang="scss">
.help {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  max-width: 100%;
  width: 100%;
}

.help-image {
  width: 100%;
  max-width: 900px;
  margin-bottom: 1.5rem;

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 30px;
    box-sizing: border-box;
    border: 6px solid $red;
  }
}

.help-box {
  position: relative;
  max-width: 100%;
  width: 100%;
  background-color: $darker-red;
  color: white;
  border-radius: 12px;
  padding: 2rem;


  h1 {
    margin: 0 0 1rem;
  }

  p {
    line-height: 1.6;
    margin-bottom: 1rem;
  }
}

.help-back {
  display: inline-flex;
  color: white;
  margin-bottom: 1rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>
