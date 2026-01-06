<template>
  <div class="page page-modify">

    <Zero_Core__Toaster />

    <TabBar
      :tabs="mainTabs"
      :active-tab="activeMainTab"
      orientation="horizontal"
      @changeTab="changeTab('main', ...arguments)" />

    <!-- ===================================================== Documentation -->
    <div
      v-if="activeMainTab === 'documentation'"
      class="documentation-sectional">

      <div class="grid">
        <div class="col">
          <div class="content">
            <MarkdownParser :markdown="documentation" />
          </div>
        </div>
      </div>

    </div>

    <!-- ====================================================== Website Data -->
    <div
      v-if="activeMainTab === 'website-data' && activeWebsiteDataTab !== ''"
      class="website-data-sectionals">

      <TabBar
        :tabs="websiteDataTabs"
        :active-tab="activeWebsiteDataTab"
        orientation="vertical"
        @changeTab="changeTab('website-data', ...arguments)" />

      <div class="content">
        <SectionalPages
          :active-tab="activeWebsiteDataTab"
          @submitForm="submitForm" />
      </div>

    </div>

    <!-- =========================================================== Results -->
    <div
      v-if="activeMainTab === 'results'"
      class="results-sectional">

      <ResultExplorer />

      <CsvUploader
        :options="uploaderOptions"
        :uploading="csvUploading"
        :processing="csvProcessing"
        :success="csvComplete"
        :error="csvError"
        @fileSending="fileSending"
        @fileUploaded="fileUploaded" />

    </div>

    <!-- ========================================================= Groupings -->
    <div
      v-if="activeMainTab === 'groupings' && activeGroupingTab !== ''"
      class="grouping-sectionals">

      <TabBar
        :tabs="groupingTabs"
        :active-tab="activeGroupingTab"
        orientation="vertical"
        @changeTab="changeTab('grouping', ...arguments)" />

      <div class="content">
        <SectionalGroupings :active-tab="activeGroupingTab" />
      </div>

    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapActions } from 'vuex'

import TabBar from '@/components/admin/TabBar'
import SectionalPages from '@/components/admin/Sectional__Pages' // eslint-disable-line
import SectionalGroupings from '@/components/admin/Sectional__Groupings' // eslint-disable-line
import CsvUploader from '@/components/admin/CsvUploader'
import ResultExplorer from '@/components/admin/ResultExplorer'
import MarkdownParser from '@/components/admin/MarkdownParser'

import DocumentationMarkdown from '@/content/documentation.md'

// ====================================================================== Export
export default {
  name: 'PageAdmin',

  meta: {
    requiresAuth: true
  },

  components: {
    TabBar,
    SectionalPages,
    SectionalGroupings,
    CsvUploader,
    ResultExplorer,
    MarkdownParser
  },

  data () {
    const self = this
    return {
      mainTabs: [
        { slug: 'documentation', label: 'Documentation' },
        { slug: 'website-data', label: 'Pages' },
        { slug: 'results', label: 'Results' },
        { slug: 'groupings', label: 'Groupings' }
      ],
      websiteDataTabs: [
        { slug: 'home', label: 'Home' },
        // { slug: 'search-data', label: 'Search Data' },
        { slug: 'about', label: 'About' },
        { slug: 'definitions', label: 'Definitions' },
        { slug: 'site-header', label: 'Site Header' },
        { slug: 'site-footer', label: 'Site Footer' }
      ],
      groupingTabs: [
        { slug: 'outcome', label: 'Outcome' },
        { slug: 'estimator', label: 'Estimator' }
      ],
      activeMainTab: '',
      activeWebsiteDataTab: '',
      activeGroupingTab: '',
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

  async fetch ({ store }) {
    await store.dispatch('admin/getSiteContent')
    await store.dispatch('result/getResultCount')
  },

  computed: {
    documentation () {
      return DocumentationMarkdown
    }
  },

  created () {
    this.activeMainTab = this.mainTabs[0].slug
    this.activeWebsiteDataTab = this.websiteDataTabs[0].slug
    this.activeGroupingTab = this.groupingTabs[0].slug
  },

  methods: {
    ...mapActions({
      postSiteContent: 'admin/postSiteContent',
      processCsv: 'admin/processCsv',
      getResultCount: 'result/getResultCount'
    }),
    changeTab (key, slug) {
      if (key === 'main') {
        this.activeMainTab = slug
      } else if (key === 'website-data') {
        this.activeWebsiteDataTab = slug
      } else if (key === 'grouping') {
        this.activeGroupingTab = slug
      }
    },
    submitForm (payload) {
      this.postSiteContent(payload)
    },
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
        const response = await this.processCsv()
        this.csvProcessing = false
        if (response.data.error) {
          this.csvError = response.data.error
        } else {
          this.csvComplete = response.data.message
        }
        this.getResultCount()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.page-modify {
  padding-top: $adminSiteHeaderHeight;
}

.website-data-sectionals,
.grouping-sectionals {
  display: flex;
  flex-direction: row;
}

.content {
  flex: 1;
}

.documentation-sectional {
  padding: 5rem 0;
  [class~="grid"],
  [class*="grid-"],
  [class*="grid_"] {
    width: 61.25rem;
  }
}

.results-sectional {
  padding: 2rem;
}

.grouping-sectionals {
  align-items: flex-start;
  .content {
    padding: 2rem;
  }
}

::v-deep .toaster {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: fixed;
  top: auto;
  bottom: 0;
  left: 50%;
  padding: 1rem 0;
  transform: translateX(-50%);
  z-index: 100000;
  .toast {
    @include shadow1;
    background-color: $voidColourSuccessSolid;
    color: white;
    .message {
      font-weight: 600;
    }
  }
}
</style>
