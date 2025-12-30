<template>
  <div class="page page-error">

    <div class="grid">
      <div class="col">
        <div class="content">
          <h1 class="heading">
            404
          </h1>
          <div class="message">
            Looks like we couldn't find the page you were looking for.
          </div>
          <ButtonCTA
            text="Go To Home"
            href="/" />
        </div>
        <RingsOblong
          colour="white"
          class="rings-oblong-1" />
        <RingsOblong
          orientation="horizontal"
          class="rings-oblong-2" />
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapActions } from 'vuex'

// import SiteHeader from '@/components/Shared/SiteHeader'
// import SiteFooter from '@/components/Shared/SiteFooter'
import ButtonCTA from '@/components/Shared/ButtonCTA'
import RingsOblong from '@/components/Page_Home/RingsOblong'

// ====================================================================== Export
export default {
  name: 'PageError',

  components: {
    // SiteHeader,
    // SiteFooter,
    ButtonCTA,
    RingsOblong
  },

  serverPrefetch () {
    return this.fetchItems()
  },

  created () {
    this.fetchItems()
  },

  methods: {
    ...mapActions({
      getSiteContent: 'admin/getSiteContent'
    }),
    async fetchItems () {
      await this.getSiteContent(true)
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.page {
  position: relative;
  z-index: 10;
}

.page,
[class~="grid"],
[class*="grid-"],
[class*="grid_"],
.content {
  height: 100vh;
}

.content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10rem 0;
  z-index: 10;
}

.heading {
  font-size: 6rem;
}

// ///////////////////////////////////////////////////////////////// RingsOblong
.rings-oblong-1,
.rings-oblong-2 {
  position: absolute;
  z-index: 5;
}

.rings-oblong-1 {
  top: calc(50% - 15rem);
  left: calc(50% - 20rem);
}

.rings-oblong-2 {
  position: absolute;
  top: calc(50% - 15rem);
  right: calc(50% - 30rem);
}
</style>
