<template>
  <div class="page page-modify">

    <div class="form">

      <div class="field">
        <label>Username</label>
        <input
          v-model="email"
          type="text"
          placeholder="Your username" />
      </div>

      <div class="field">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="Your password" />
      </div>

      <div v-if="authMessage" class="field auth-message">
        {{ authMessage }}
      </div>

      <div class="field">
        <button
          class="button-login"
          @click="login({ email, password })">
          <SpinnerMaterialCircle v-if="loading" class="spinner" />
          <span v-if="!loading">Login</span>
        </button>
      </div>

    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'

import SpinnerMaterialCircle from '@/components/Shared/Spinner_MaterialCircle'

// ====================================================================== Export
export default {
  name: 'PageLogin',

  components: {
    SpinnerMaterialCircle
  },

  data () {
    return {
      email: '',
      password: ''
    }
  },

  computed: {
    ...mapGetters({
      loading: 'admin/loading',
      authMessage: 'admin/authMessage'
    })
  },

  methods: {
    ...mapActions({
      login: 'admin/login'
    })
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.page-modify {
  padding: 2rem;
}

.field {
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}

input {
  background: white;
  padding: 0.375rem 0.625rem;
  width: 20rem;
  border: 1px solid $gray300;
  border-radius: 0.5rem;
}

.auth-message {
  color: $voidThemeRed;
  font-weight: 600;
}

.button-login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 0.75rem;
  height: 2rem;
  width: 4.1825rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  border-radius: 0.25rem;
  background-color: $gray700;
  &:hover {
    background-color: $electricViolet;
  }
}
</style>
