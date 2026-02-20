<template>
  <div class="modal home">

    <section class="white-boxed">

      <section id="section-1" class="section section-split-text-image">
        <div class="grid-center">
          <div class="col-12_lg-11">
            <div class="grid-center-middle">
              <div class="col-7_sm-9_mi-11_ti-12">
                <img :src="section_1_image" />
              </div>
              <div class="col-4_sm-9_mi-11_ti-12" data-push-left="off-1_sm-0">
                <h1>{{ section_1_heading }}</h1>
                <div class="text post-format" v-html="section_1_description"></div>
                <ButtonCTA
                  :text="section_1_cta_text"
                  @changeRoute="$emit('changeRoute', 'search-data')" />
              </div>
            </div>
          </div>
        </div>
        <RingsOblong
          colour="white"
          class="rings-oblong-1" />
      </section>

      <section id="section-2" class="section section-split-text-image reverse">
        <div class="grid-center">
          <div class="col-12_lg-11">
            <div class="grid-center-middle-reverse">
              <div class="col-7_sm-9_mi-11_ti-12">
                <img :src="section_2_image" />
              </div>
              <div class="col-4_sm-9_mi-11_ti-12" data-push-right="off-1_sm-0">
                <LabelElement :text="section_2_label" />
                <h2>{{ section_2_heading }}</h2>
                <div class="text post-format" v-html="section_2_description"></div>
                <ButtonCTA
                  :text="section_2_cta_text"
                  @changeRoute="$emit('changeRoute', 'search-data')" />
              </div>
            </div>
          </div>
        </div>
        <RingsOblong class="rings-oblong-2" />
        <RingsOblong
          orientation="horizontal"
          class="rings-oblong-3" />
      </section>

    </section>

    <section id="section-3" class="section section-resources-about">
      <div class="grid-center">
        <div class="col-12_lg-11">
          <div class="grid-center">
            <div class="col-4_sm-6_mi-11_ti-12">
              <LabelElement
                :text="section_3_label"
                :rings="true" />
              <div class="links-container">
                <a
                  v-for="(link, linkIndex) in section_3_links"
                  :key="`link-${linkIndex}`"
                  :href="link.url"
                  class="link"
                  target="_blank">
                  <div class="link-label">
                    {{ link.text }}
                  </div>
                  <div class="link-url">
                    {{ link.url }}
                  </div>
                </a>
              </div>
            </div>
            <div class="col-6_mi-11_ti-12" data-push-left="off-2_sm-0">
              <div class="content-inner">
                <LabelElement :text="section_4_label" />
                <img :src="section_4_image" class="image" />
                <div class="text post-format" v-html="section_4_subtext"></div>
                <ButtonCTA
                  :text="section_4_cta_text"
                  type="transparent"
                  @changeRoute="$emit('changeRoute', 'about')" />
              </div>
              <RingsOblong
                orientation="horizontal"
                colour="white"
                class="rings-oblong-4" />
              <RingsOblong class="rings-oblong-5" />
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

import LabelElement from '@/components/Page_Home/LabelElement'
import ButtonCTA from '@/components/Shared/ButtonCTA'
import RingsOblong from '@/components/Page_Home/RingsOblong'

// ====================================================================== Export
export default {
  name: 'Home',

  components: {
    LabelElement,
    ButtonCTA,
    RingsOblong
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent.home
    },
    section_1_cta_text () {
      return this.content.section_1_cta_text.value
    },
    section_1_description () {
      return this.content.section_1_description.value
    },
    section_1_heading () {
      return this.content.section_1_heading.value
    },
    section_1_image () {
      return this.$getImageUrl(this.content.section_1_image.value, 'original')
    },
    section_2_cta_text () {
      return this.content.section_2_cta_text.value
    },
    section_2_description () {
      return this.content.section_2_description.value
    },
    section_2_heading () {
      return this.content.section_2_heading.value
    },
    section_2_image () {
      return this.$getImageUrl(this.content.section_2_image.value, 'original')
    },
    section_2_label () {
      return this.content.section_2_label.value
    },
    section_3_links () {
      const content = this.content
      return [
        { text: content.section_3_group_1_link_1_text.value, url: content.section_3_group_1_link_1_url.value },
        { text: content.section_3_group_1_link_2_text.value, url: content.section_3_group_1_link_2_url.value },
        { text: content.section_3_group_3_link_1_text.value, url: content.section_3_group_3_link_1_url.value }
      ]
    },
    section_3_label () {
      return this.content.section_3_label.value
    },
    section_4_cta_text () {
      return this.content.section_4_cta_text.value
    },
    section_4_image () {
      return this.$getImageUrl(this.content.section_4_image.value, 'original')
    },
    section_4_label () {
      return this.content.section_4_label.value
    },
    section_4_subtext () {
      return this.content.section_4_subtext.value
    }
  }
}
</script>

<style lang="scss" scoped>
$imgOffset: 6rem;
$width: 5rem;
$logosPerRow: 3;

// ///////////////////////////////////////////////////////////////////// General
.home {
  padding-bottom: 5rem;
  @include mini {
    padding-bottom: 3rem;
  }
}

[class~="grid"],
[class*="grid-"],
[class*="grid_"],
.content-inner,
.section {
  position: relative;
  z-index: 10;
}

.content-inner {
  display: flex;
  flex-direction: column;
  &.center {
    align-items: center;
  }
}

#section-1 {
  @include small {
    margin-bottom: 5rem;
  }
  @include mini {
    margin-top: 0;
  }
  @include tiny {
    margin-top: 3rem;
  }
}

#section-2 {
  padding-bottom: 5rem;
  @include mini {
    padding-bottom: 3rem;
  }
}

#section-3 {
  padding-bottom: 3rem;
  margin-top: 15rem;
  @include small {
    margin-top: 5rem;
  }
}

.white-boxed {
  position: relative;
  margin-bottom: 5rem;
  &:before {
    content: '';
    position: absolute;
    top: -$siteHeaderHeight;
    left: 48vw;
    width: 52vw;
    height: calc(100% + #{$siteHeaderHeight * 0.75});
    background-color: white;
    z-index: 5;
    @include small {
      display: none;
    }
  }
}

// //////////////////////////////////////////////////////////// Split Text Image
.section-split-text-image {
  &.reverse {
    img {
      right: $imgOffset;
      left: auto;
    }
  }
  img {
    position: relative;
    width: calc(100% + #{$imgOffset * 2});
    top: 3rem;
    left: math.div(-$imgOffset * 2, 3);
    @include small {
      position: static;
      width: 100%;
      margin-bottom: -3rem;
    }
    @include mini {
      margin-bottom: 0;
    }
  }
}

// /////////////////////////////////////////////////////////////////////// Logos
.logo-grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.logo-container {
  width: calc((100% / #{$logosPerRow}) - (#{$logosPerRow - 1} * #{$width}) / #{$logosPerRow});
  margin-bottom: $width;
  &:not(:nth-child(#{$logosPerRow}n)) {
    margin-right: calc((#{$logosPerRow - 1} * #{$width}) / #{$logosPerRow});
  }
}

.logo {
  filter: grayscale(1);
}

// /////////////////////////////////////////////////////////// Resources & About
.section-resources-about {
  .image {
    @include shadow2;
    margin-bottom: 1.875rem;
  }
  .link {
    margin-bottom: 1.75rem;
    transition: 250ms ease-out;
    &:hover {
      transition: 250ms ease-in;
      transform: scale(1.025);
    }
  }
  .link-label {
    font-weight: 900;
  }
  ::v-deep .text.post-format {
    text-align: center;
    padding: 0 2rem;
    @include tiny {
      padding: 0;
    }
    p {
      font-size: 1.1875rem;
      line-height: 1.8;
    }
  }
}

.links-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

// ///////////////////////////////////////////////////////////////// RingsOblong
.rings-oblong-1,
.rings-oblong-2,
.rings-oblong-3,
.rings-oblong-4,
.rings-oblong-5 {
  position: absolute;
  z-index: 5;
  @include small {
    display: none;
  }
}

.rings-oblong-1 {
  top: calc(100% - 25rem);
  left: calc(50% - 35rem);
}

.rings-oblong-2 {
  bottom: calc(100% - 25rem);
  right: calc(50% - 38rem);
}

.rings-oblong-3 {
  top: calc(100% - 3rem);
  left: calc(50% - 49rem);
}

.rings-oblong-4 {
  bottom: calc(100% + 2rem);
  right: calc(50% - 48rem);
}

.rings-oblong-5 {
  top: -2rem;
  left: calc(50% - 7rem);
}
</style>
