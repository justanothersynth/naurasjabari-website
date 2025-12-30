<template>
  <div class="page page-home">

    <SiteHeader
      :selected-slide="selectedSlide"
      @changeRoute="changeRoute"
      @setIndices="setIndices" />

    <button
      ref="applyFiltersButton"
      :class="['apply-filters-button', applyFiltersButtonPosition.position, { disabled: !selectedOptions, loading: loadingResultList, visible: loadResultsButtonVisible }]"
      :style="{ left: applyFiltersButtonPosition.left, bottom: applyFiltersButtonPosition.bottom }"
      :disabled="!selectedOptions"
      @click="loadResults">
      <div class="button-content">
        <label class="label">Proceed</label>
        <div class="spinner-container">
          <Spinner />
        </div>
      </div>
    </button>

    <PageSlider
      v-if="routeLoaded"
      ref="slider"
      :selected-slide="selectedSlide"
      @loaded="init"
      @changeRoute="changeRoute" />

    <SiteFooter
      :selected-slide="selectedSlide"
      @changeRoute="changeRoute" />

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'

import SiteHeader from '@/components/Shared/SiteHeader'
import SiteFooter from '@/components/Shared/SiteFooter'
import PageSlider from '@/components/Page_Home/PageSlider'
import Spinner from '@/components/Spinner'

// import Config from '@/nuxt.config'

// =================================================================== Functions
/*
  cookie name = 'douglas__visited'
  visited once = 1
  visited twice = 2
*/
const setAndCheckCookie = (instance) => {
  if (process.browser) {
    const visited = instance.$ls.get('visited')
    if (!visited) {
      instance.$ls.set('visited', 1)
      instance.selectedSlide = 0
    } else if (visited === 1) {
      instance.$ls.set('visited', 2)
      instance.selectedSlide = 0
    } else {
      instance.selectedSlide = 1
    }
    instance.routeLoaded = true
  }
}

const positionApplyFiltersButton = (instance) => {
  const panelLeft = instance.$refs.slider.$refs.panelLeft
  const wH = instance.wH
  const rect = panelLeft.getBoundingClientRect()
  const left = rect.left
  const bottom = rect.bottom
  if (instance.selectedSlide !== 1) {
    if (instance.applyFiltersButtonPosition.position !== 'hidden') {
      instance.applyFiltersButtonPosition = {
        position: 'hidden',
        left: left + 'px',
        bottom: '0px'
      }
    }
  } else if (bottom < wH) {
    instance.applyFiltersButtonPosition = {
      left: left + 'px',
      bottom: (wH - bottom) + 'px',
      position: 'floating'
    }
  } else {
    instance.applyFiltersButtonPosition = {
      position: 'fixed',
      left: left + 'px',
      bottom: '0px'
    }
  }
}

/*
  If URL contains page tag as a hash (ex: /#search-data) and the page is live,
  then toggle the relevant slide
*/
const detectSlideFromRoute = (action, instance) => {
  const tag = instance.$route.hash.split('#')[1]
  const slide = instance.indices.find(obj => obj.tag === tag)
  if (slide) {
    const index = slide.index
    instance.selectedSlide = index
    instance.routeLoaded = true
    if (action === 'update') {
      positionApplyFiltersButton(instance)
      toggleApplyFiltersButtonVisibility(instance)
    }
  } else {
    setAndCheckCookie(instance)
  }
}

const toggleApplyFiltersButtonVisibility = (instance) => {
  if (instance.selectedSlide !== 1) {
    instance.loadResultsButtonVisible = false
  } else {
    instance.loadResultsButtonVisible = true
  }
}

// ====================================================================== Export
export default {
  name: 'PageHome',

  components: {
    SiteHeader,
    SiteFooter,
    PageSlider,
    Spinner
  },

  async asyncData ({ store, route }) {
    await store.dispatch('admin/getSiteContent', true)
  },

  data () {
    return {
      selectedSlide: false,
      loadingResultList: false,
      loadResultsButtonVisible: false,
      applyFiltersButtonPosition: {
        position: 'unset',
        left: '0px',
        bottom: '0px'
      },
      scroll: false,
      resize: false,
      routeLoaded: false,
      seoTitle: '',
      seoDescription: ''
    }
  },

  async fetch ({ store, route }) {
    await store.dispatch('query/getFilters', 'risk-factor')
    await store.dispatch('query/getFilters', 'population')
    await store.dispatch('query/getFilters', 'first-author')
    await store.dispatch('query/getFilters', 'country')
    await store.dispatch('query/getFilters', 'year')
    await store.dispatch('query/getFilters', 'estimator')
    await store.dispatch('query/getFilters', 'size-effect')
    await store.dispatch('query/getFilters', 'outcome')
  },

  head () {
    return {
      title: this.seoTitle,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.seoDescription
        }
      ]
    }
  },

  computed: {
    ...mapGetters({
      selectedFilterOptions: 'query/filterOptions',
      displayChart: 'result/displayChart'
    }),
    selectedOptions () {
      const options = this.selectedFilterOptions
      return Object.keys(options).length > 0 ? options : false
    }
  },

  watch: {
    '$route' (val) {
      detectSlideFromRoute('update', this)
    },
    selectedFilterOptions () {
      const timeout = setTimeout(() => {
        positionApplyFiltersButton(this)
        clearTimeout(timeout)
      }, 10)
    }
  },

  mounted () {
    this.$nextTick(() => {
      detectSlideFromRoute('init', this)
    })
  },

  beforeDestroy () {
    if (this.scroll) { window.removeEventListener('scroll', this.scroll) }
    if (this.resize) { window.removeEventListener('resize', this.resize) }
  },

  methods: {
    ...mapActions({
      getResultList: 'result/getResultList',
      setDisplayChart: 'result/setDisplayChart',
      setDisplayTables: 'result/setDisplayTables',
      setSelectedResults: 'result/setSelectedResults',
      setFirstSearchPerformed: 'result/setFirstSearchPerformed'
    }),
    init () {
      this.wH = window.innerHeight
      let timeout = false
      const scroll = () => {
        positionApplyFiltersButton(this)
        toggleApplyFiltersButtonVisibility(this)
      }; scroll()
      const resize = () => {
        this.wH = window.innerHeight
        positionApplyFiltersButton(this)
        if (!timeout) {
          timeout = setTimeout(() => {
            positionApplyFiltersButton(this)
            clearTimeout(timeout)
          }, 250)
        } else {
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            positionApplyFiltersButton(this)
            clearTimeout(timeout)
          }, 250)
        }
      }
      this.scroll = this.$throttle(scroll, 1)
      this.resize = this.$throttle(resize, 100)
      window.addEventListener('scroll', this.scroll)
      window.addEventListener('resize', this.resize)
    },
    setIndices (indices) {
      this.indices = indices
    },
    changeRoute (tag) {
      this.$router.push({ path: '/', ...tag && { hash: `#${tag}` } })
    },
    async loadResults () {
      this.loadingResultList = true
      await this.setSelectedResults([])
      const results = await this.getResultList()
      this.loadingResultList = false
      this.setFirstSearchPerformed()
      if (results.length > 0) {
        this.setDisplayChart(true)
      } else {
        this.setDisplayChart(false)
      }
      if (this.displayChart) {
        this.setDisplayTables(false)
      } else {
        this.setDisplayTables(true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$applyFiltersButtonHeight: 3rem;

// ///////////////////////////////////////////////////////////////////// General
.page {
  position: relative;
  z-index: 10;
  transition: 400ms ease-in-out;
}

// ////////////////////////////////////////////////////// [Button] Apply Filters
.apply-filters-button {
  position: fixed;
  bottom: 0;
  left: calc((100vw - #{$containerWidth}) / 2 + 1rem);
  width: 20rem;
  padding: 1rem;
  z-index: 1000;
  transition: transform 250ms ease-out, height 250ms ease-out;
  &:hover:not(.disabled) {
    transition: height 250ms ease-in;
    .spinner {
      &:after {
        transition: background-color 150ms ease-out;
        background-color: $hawkesBlue;
      }
    }
    .button-content {
      transition: background-color 150ms ease-in, color 150ms ease-in;
      background-color: $hawkesBlue;
      color: $mineShaft;
    }
  }
  &:not(.visible) {
    transition: transform 250ms ease-in;
    transform: translateY(5rem);
  }
  &.disabled {
    opacity: 1;
    .button-content {
      transition: background-color 150ms ease-in;
      background-color: #666666;
      color: #AAAAAA;
      cursor: no-drop;
    }
  }
  &.loading {
    .label,
    .spinner-container {
      transition: 250ms ease-in;
    }
    .label {
      transform: translateY(1rem);
      opacity: 0;
    }
    .spinner-container {
      transition: 250ms ease-in;
      transform: translateY(0);
      opacity: 1;
    }
  }
  .button-content {
    @include label;
    position: relative;
    background-color: $mineShaft;
    width: 100%;
    height: $applyFiltersButtonHeight;
    color: white;
    border-radius: 0.25rem;
    transition: background-color 150ms ease-out;
  }
  .label,
  .spinner-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    transition: 150ms ease-out;
  }
  .spinner-container {
    transform: translateY(-1rem);
    opacity: 0;
  }
}
</style>
