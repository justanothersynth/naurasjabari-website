<template>
  <div id="site-header" :class="`selected-slide-${selectedSlide}`">
    <div class="grid-noGutter force-centered">
      <div class="col">
        <div class="content">

          <nuxt-link
            class="logo-wrapper"
            to="/"
            @click.native="$emit('changeRoute', 'search-data')">
            <img id="site-logo" :src="section_1_logo" />
          </nuxt-link>

          <div class="text">
            {{ section_2_description }}
          </div>

          <SiteNavigation
            v-if="!hideNav"
            :selected-slide="selectedSlide"
            :hide-nav="hideNav"
            v-on="$listeners" />

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

import SiteNavigation from '@/components/Shared/SiteNavigation'

// ====================================================================== Export
export default {
  name: 'SiteHeader',

  components: {
    SiteNavigation
  },

  props: {
    selectedSlide: {
      type: [Number, Boolean],
      required: false,
      default: false
    },
    hideNav: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent['site-header']
    },
    section_1_logo () {
      return this.$getImageUrl(this.content.section_1_logo.value, 'original')
    },
    section_2_description () {
      return this.content.section_2_description.value
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
#site-header {
  position: relative;
  border-bottom: 1px solid transparent;
  z-index: 100;
  transition: 250ms ease-out;
  &.selected-slide-1 {
    transition: 250ms ease-in;
    border-bottom-color: $borderColor;
  }
}

.content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: $siteHeaderHeight;
  padding: 0 1rem;
  @include mini {
    height: 5rem;
  }
  @include tiny {
    flex-direction: column;
    height: 9rem;
  }
}

// //////////////////////////////////////////////////////////////////////// Logo
.logo-wrapper {
  width: 16rem;
  padding-top: 1.25rem;
  @include medium {
    width: 10rem;
    padding-top: 0.5rem;
  }
}

// //////////////////////////////////////////////////////////////////////// Text
.text {
  flex: 1;
  padding: 0 4rem;
  font-size: 0.8125rem;
  @include small {
    display: none;
  }
}
</style>
