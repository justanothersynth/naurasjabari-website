<template>

  <FormBuilder
    v-if="content"
    :fields="content"
    :slug="activeTab"
    :namespace="activeTab"
    v-on="$listeners" />

</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

import FormBuilder from '@/components/admin/form/Builder'

// ====================================================================== Export
export default {
  name: 'SectionalPages',

  components: {
    FormBuilder
  },

  props: {
    activeTab: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent[this.activeTab]
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
</style>
