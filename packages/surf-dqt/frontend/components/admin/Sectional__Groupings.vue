<template>
  <section class="sectional-groupings">

    <h2 class="heading">
      {{ activeTab }}
    </h2>

    <CsvUploader
      :options="uploaderOptions"
      :uploading="csvUploading"
      :processing="csvProcessing"
      :success="csvComplete"
      :error="csvError"
      @fileSending="fileSending"
      @fileUploaded="fileUploaded" />

  </section>
</template>

<script>
// ===================================================================== Imports
import { mapActions } from 'vuex'

import CsvUploader from '@/components/admin/CsvUploader'

// ====================================================================== Export
export default {
  name: 'SectionalGroupings',

  components: {
    CsvUploader
  },

  props: {
    activeTab: {
      type: String,
      required: true
    }
  },

  data () {
    const self = this
    return {
      uploaderOptions: {
        url: self.$config.csvUploadPath,
        withCredentials: true,
        createImageThumbnails: false,
        maxFiles: 1,
        acceptedFiles: '.csv',
        paramName: 'csv-file',
        timeout: 10000
      },
      csvUploading: false,
      csvProcessing: false,
      csvComplete: false,
      csvError: false
    }
  },

  watch: {
    activeTab (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.csvUploading = false
        this.csvProcessing = false
        this.csvComplete = false
      }
    }
  },

  methods: {
    ...mapActions({
      processGroupingCsv: 'admin/processGroupingCsv'
    }),
    fileSending () {
      this.csvComplete = false
      this.csvProcessing = false
      this.csvUploading = true
      this.csvError = false
    },
    async fileUploaded (xhr) {
      this.csvUploading = false
      this.csvProcessing = true
      if (xhr.status === 200) {
        const response = await this.processGroupingCsv(this.activeTab)
        this.csvProcessing = false
        if (response.data.error) {
          this.csvError = response.data.error
        } else {
          this.csvComplete = response.data.message
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.heading {
  text-transform: capitalize;
}
</style>
