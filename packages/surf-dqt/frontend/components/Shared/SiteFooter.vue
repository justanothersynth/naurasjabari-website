<template>
  <div id="site-footer">

    <section class="panel-top">
      <div class="grid-center">
        <div class="col-11_ti-12">
          <div class="panel-top-content">

            <button
              class="scroll-to-top-button"
              @click="$scrollToTop(500)">
              <div class="chevron"></div>
              <span class="button-text">To Top</span>
            </button>

            <img
              v-for="(logo, index) in logoList"
              :key="index"
              :src="logo"
              class="logo" />

          </div>
        </div>
      </div>
    </section>

    <section class="panel-bottom">
      <div class="grid-center">
        <div class="col-11">
          <div class="grid-spaceBetween">

            <div class="col-5_sm-6_mi-9">
              <div class="panel-left">
                <nuxt-link
                  to="/"
                  @click.native="$emit('changeRoute', 'search-data')">
                  <img class="primary-logo" :src="section_2_logo" />
                </nuxt-link>
                <div class="address" v-html="section_2_contact">
                  <!-- <div
                    v-for="line in address"
                    :key="line.id"
                    class="address-line">
                    {{ line.text }}
                  </div> -->
                </div>
              </div>
            </div>

            <div class="col-5_lg-7_sm-12">
              <div class="panel-right">
                <SiteNavigation
                  v-if="!hideNav"
                  :selected-slide="selectedSlide"
                  :hide-nav="hideNav"
                  v-on="$listeners" />
                <div class="copyright" v-html="section_2_copyright"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

import SiteNavigation from '@/components/Shared/SiteNavigation'

// ====================================================================== Export
export default {
  name: 'SiteFooter',

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
      return this.siteContent['site-footer']
    },
    logoList () {
      return [
        this.$getImageUrl(this.content.section_1_logo_1.value, 'original'),
        this.$getImageUrl(this.content.section_1_logo_2.value, 'original'),
        this.$getImageUrl(this.content.section_1_logo_3.value, 'original'),
        this.$getImageUrl(this.content.section_1_logo_4.value, 'original'),
        this.$getImageUrl(this.content.section_1_logo_5.value, 'original')
      ]
    },
    section_2_logo () {
      return this.$getImageUrl(this.content.section_2_logo.value, 'original')
    },
    section_2_contact () {
      return this.content.section_2_contact.value
    },
    section_2_copyright () {
      return this.content.section_2_copyright.value
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////// [Panel] Top
.panel-top {
  border-top: 1px solid $borderColor;
  border-bottom: 1px solid $borderColor;
}

.panel-top-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 7.5rem 0;
  @include mini {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
  }
  @include tiny {
    padding: 2rem 0;
  }
}

.scroll-to-top-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  top: 1rem;
  right: 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  opacity: 0.75;
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.chevron {
  width: 1rem;
  margin-right: 0.75rem;
  &:before {
    content: '';
    display: inline-block;
    border-style: solid;
    border-width: 0.125rem 0.125rem 0 0;
    width: 7px;
    height: 7px;
    position: relative;
    top: 0.125em;
    left: 0.125rem;
    transform: rotate(-45deg);
    transition: 250ms ease-out;
  }
}

.logo {
  max-width: 8.5rem;
  max-height: 3.5rem;
  width: auto;
  filter: grayscale(1);
  @include mini {
    margin: 2rem;
  }
}

// ////////////////////////////////////////////////////////////// [Panel] Bottom
.panel-bottom {
  padding: 5rem 0;
  @include mini {
    padding-top: 3rem;
    padding-bottom: 1.5rem;
  }
}

.panel-left {
  @include small {
    margin-bottom: 5rem;
  }
  @include mini {
    margin-bottom: 3rem;
  }
}

.panel-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.primary-logo {
  max-width: 22rem;
  margin-left: -3rem;
  margin-bottom: 0.5rem;
  @include mini {
    margin-left: -1.5rem;
    margin-bottom: 0;
  }
}

::v-deep .address {
  display: flex;
  flex-direction: column;
  p {
    font-size: 0.875rem;
  }
}

.navigation {
  @include small {
    margin-bottom: 2rem;
  }
  @include mini {
    margin-bottom: 1rem;
  }
}

::v-deep .copyright {
  font-size: 0.75rem;
  line-height: 2;
  p {
    font-size: inherit;
    line-height: inherit;
  }
}
</style>
