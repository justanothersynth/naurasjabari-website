<template>
  <div class="modal definitions">

    <!-- ///////////////////////////////////////////////////////// Section 1 -->
    <section id="section-1" class="section section-content">
      <div class="grid-center">
        <div class="col-9_sm-10_mi-11">
          <div class="content-inner">

            <h1 class="page-heading">
              {{ section_1_heading }}
            </h1>

            <LabelElement :text="section_2_heading" />

            <div class="text post-format" v-html="section_2_description"></div>

          </div>
        </div>
      </div>
    </section>

    <!-- ///////////////////////////////////////////////////////// Section 2 -->
    <section id="section-2" class="section section-content">
      <div class="grid-center">
        <div class="col-9_sm-10_mi-11">
          <div class="content-inner">

            <LabelElement :text="section_3_heading" />

            <div class="text post-format" v-html="section_3_description_1"></div>

            <img class="image" :src="section_3_image" />

            <div class="text post-format" v-html="section_3_description_2"></div>

          </div>
        </div>
      </div>
    </section>

    <!-- ///////////////////////////////////////////////////////// Section 2 -->
    <section id="section-3" class="section section-content">
      <div class="grid-center">
        <div class="col-9_sm-10_mi-11">
          <div class="content-inner">

            <LabelElement :text="section_4_heading" />

            <div class="text post-format" v-html="section_4_description"></div>

            <img class="image" :src="section_4_image" />

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

// ====================================================================== Export
export default {
  name: 'Definitions',

  components: {
    LabelElement
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent.definitions
    },
    section_1_heading () {
      return this.content.section_1_heading.value
    },
    section_2_heading () {
      return this.content.section_2_heading.value
    },
    section_2_description () {
      return this.content.section_2_description.value
    },
    section_3_heading () {
      return this.content.section_3_heading.value
    },
    section_3_description_1 () {
      return this.content.section_3_description_1.value
    },
    section_3_image () {
      return this.$getImageUrl(this.content.section_3_image.value, 'original')
    },
    section_3_description_2 () {
      return this.content.section_3_description_2.value
    },
    section_4_heading () {
      return this.content.section_4_heading.value
    },
    section_4_description () {
      return this.content.section_4_description.value
    },
    section_4_image () {
      return this.$getImageUrl(this.content.section_4_image.value, 'original')
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.definitions {
  padding: 5rem 0;
}

.page-heading {
  margin-bottom: 3rem;
}

.image {
  margin-top: 3rem;
  border-radius: 0.25rem;
  &:not(:last-child) {
    margin-bottom: 3rem;
  }
}
</style>
