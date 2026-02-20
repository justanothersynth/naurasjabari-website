<template>
  <div class="modal about">

    <!-- ///////////////////////////////////////////////////////// Section 1 -->
    <section id="section-1" class="section section-banner">

      <div class="grid-center">
        <div class="col-11">
          <div class="content-inner">

            <img :src="section_1_image" />

          </div>
        </div>
      </div>

      <RingsOblong
        orientation="horizontal"
        class="rings-oblong-1" />

      <RingsOblong
        colour="white"
        class="rings-oblong-2" />

    </section>

    <!-- ///////////////////////////////////////////////////////// Section 2 -->
    <section id="section-2" class="section section-split-text-image">

      <div class="grid-center">
        <div class="col-11">
          <div class="grid-center-spaceBetween-noGutter">
            <div class="col-4_mi-6_ti-10">

              <LabelElement
                :text="section_2_label"
                margin-bottom="small"
                class="mobile-only" />

              <div class="person-profile padding-right">
                <img :src="section_2_image" />
                <div class="text post-format" v-html="section_2_subtext"></div>
              </div>

            </div>
            <div class="col-7_mi-12">

              <LabelElement
                :text="section_2_label"
                margin-bottom="small" />

              <h1>{{ section_2_name }}</h1>

              <div class="text post-format" v-html="section_2_description"></div>

            </div>
          </div>
        </div>
      </div>

      <RingsOblong
        colour="white"
        class="rings-oblong-3" />

    </section>

    <!-- ///////////////////////////////////////////////////////// Section 3 -->
    <section id="section-3" class="section section-split-text-image">

      <div class="grid-center">
        <div class="col-11">
          <div class="grid-center-spaceBetween-noGutter">
            <div class="col-7_mi-12">

              <h1>{{ section_3_name }}</h1>

              <div class="text post-format" v-html="section_3_description"></div>

            </div>
            <div class="col-4_mi-6_ti-10">

              <div class="person-profile padding-left">
                <img :src="section_3_image" />
                <div class="text post-format" v-html="section_3_subtext"></div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <RingsOblong class="rings-oblong-4" />

    </section>

    <!-- ///////////////////////////////////////////////////////// Section 4 -->
    <section id="section-4" class="section section-split-text-image">

      <div class="grid-center">
        <div class="col-11">
          <div class="grid-center-spaceBetween-noGutter">
            <div class="col-4_mi-6_ti-10">

              <div class="person-profile">
                <img :src="section_4_image" />
              </div>

            </div>
            <div class="col-7_mi-12">

              <h1>{{ section_4_name }}</h1>

              <div class="text post-format" v-html="section_4_description"></div>

            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- ///////////////////////////////////////////////////////// Section 5 -->
    <section id="section-5" class="section section-split-text-image">

      <div class="grid-center">
        <div class="col-11">
          <div class="grid-center-spaceBetween-noGutter">
            <div class="col-7_mi-12">

              <h1>{{ section_5_name }}</h1>

              <div class="text post-format" v-html="section_5_description"></div>

            </div>
            <div class="col-4_mi-6_ti-10">

              <div class="person-profile">
                <img :src="section_5_image" />
              </div>

            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- ///////////////////////////////////////////////////////// Section 6 -->
    <section id="section-6" class="section section-text">

      <div class="grid-center">
        <div class="col-11">
          <div class="grid-center-noGutter">
            <div class="col-9_mi-11_ti-12">
              <div class="content-inner">

                <LabelElement :text="section_6_label" />

                <h1>{{ section_6_heading }}</h1>

                <div class="text post-format" v-html="section_6_description"></div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <RingsOblong
        orientation="horizontal"
        class="rings-oblong-5" />

      <RingsOblong
        orientation="horizontal"
        colour="gray"
        class="rings-oblong-6" />

    </section>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

import LabelElement from '@/components/Page_Home/LabelElement'
import RingsOblong from '@/components/Page_Home/RingsOblong'

// ====================================================================== Export
export default {
  name: 'About',

  components: {
    LabelElement,
    RingsOblong
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent.about
    },
    section_1_image () {
      return this.$getImageUrl(this.content.section_1_image.value, 'original')
    },
    section_2_image () {
      return this.$getImageUrl(this.content.section_2_image.value, 'original')
    },
    section_2_label () {
      return this.content.section_2_label.value
    },
    section_2_name () {
      return this.content.section_2_name.value
    },
    section_2_description () {
      return this.content.section_2_description.value
    },
    section_2_subtext () {
      return this.content.section_2_subtext.value
    },
    section_3_image () {
      return this.$getImageUrl(this.content.section_3_image.value, 'original')
    },
    section_3_name () {
      return this.content.section_3_name.value
    },
    section_3_description () {
      return this.content.section_3_description.value
    },
    section_3_subtext () {
      return this.content.section_3_subtext.value
    },
    section_4_image () {
      return this.$getImageUrl(this.content.section_4_image.value, 'original')
    },
    section_4_name () {
      return this.content.section_4_name.value
    },
    section_4_description () {
      return this.content.section_4_description.value
    },
    section_5_image () {
      return this.$getImageUrl(this.content.section_5_image.value, 'original')
    },
    section_5_name () {
      return this.content.section_5_name.value
    },
    section_5_description () {
      return this.content.section_5_description.value
    },
    section_6_label () {
      return this.content.section_6_label.value
    },
    section_6_heading () {
      return this.content.section_6_heading.value
    },
    section_6_description () {
      return this.content.section_6_description.value
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
[class~="grid"],
[class*="grid-"],
[class*="grid_"],
.content-inner,
.section {
  position: relative;
  z-index: 10;
}

h1 {
  margin-bottom: 1.75rem;
}

.person-profile {
  @include mini {
    margin-bottom: 2rem;
  }
  img {
    @include shadow4;
    margin-bottom: 2rem;
    border-radius: 0.25rem;
  }
  &.padding-right {
    padding-right: 2rem;
    @include mini {
      padding-right: 0;
    }
  }
  &.padding-left {
    padding-left: 2rem;
    @include mini {
      padding-left: 0;
    }
  }
}

// //////////////////////////////////////////////////////////////////// Sections
#section-1 {
  padding-top: 5rem;
  @include mini {
    padding-top: 3rem;
  }
}

#section-2 {
  padding-top: 5rem;
  .person-profile {
    position: relative;
    top: 3rem;
    @include mini {
      top: 0;
    }
  }
  .label {
    &.mobile-only {
      display: none;
      @include mini {
        display: block;
        margin-bottom: 2rem;
      }
    }
  }
}

#section-3 {
  padding-top: 10rem;
  @include mini {
    padding-top: 3rem;
  }
  [class~="grid"], [class*="grid-"], [class*="grid_"] {
    > [class~="grid"], [class*="grid-"], [class*="grid_"] {
      @include mini {
        flex-direction: column-reverse;
      }
    }
  }
}

#section-4 {
  padding-top: 10rem;
  @include mini {
    padding-top: 3rem;
  }
}

#section-5 {
  padding-top: 5rem;
  @include mini {
    padding-top: 3rem;
  }
}

#section-6 {
  margin-top: 8.5rem;
  padding: 9rem 0;
  background-color: white;
  @include mini {
    margin-top: 3rem;
    padding: 3rem 0;
  }
}

// ///////////////////////////////////////////////////////////////// RingsOblong
.rings-oblong-1,
.rings-oblong-2,
.rings-oblong-3,
.rings-oblong-4,
.rings-oblong-5,
.rings-oblong-6 {
  position: absolute;
  z-index: 5;
  @include small {
    display: none;
  }
}

.rings-oblong-1 {
  top: 10rem;
  left: calc(50% - #{math.div($containerWidth, 2)} - 22rem);
}

.rings-oblong-2 {
  top: 5rem;
  right: calc(50% - #{math.div($containerWidth, 2)} - 10rem);
}

.rings-oblong-3 {
  bottom: -5rem;
  left: calc(50% - #{math.div($containerWidth, 2)} - 3rem);
}

.rings-oblong-4 {
  top: 5rem;
  right: calc(50% - #{math.div($containerWidth, 2)} - 2rem);
}

.rings-oblong-5 {
  top: 7rem;
  left: calc(50% - #{math.div($containerWidth, 2)} - 18rem);
}

.rings-oblong-6 {
  bottom: 15rem;
  right: calc(50% - #{math.div($containerWidth, 2)} - 18rem);
}
</style>
