<template>
  <div
    ref="slider"
    :class="['page-slider', { transition }]"
    :style="{ height: `${height}px` }">

    <ModalHome
      :class="{ visible: visible(0) }"
      @changeRoute="$emit('changeRoute')" />

    <div :class="['content-main', { visible: visible(1) }]">

      <div ref="panelLeft" class="panel-left">
        <Filters @filterDropdownToggled="filterDropdownToggled" />
      </div>

      <div class="panel-right">
        <div v-if="selectedOptions" class="selected-filters-container">
          <div class="panel">
            <label class="label">Selected Filters</label>
            <button
              class="clear-all-filters-button"
              @click="clearFilterOptions()">
              CLEAR ALL
            </button>
          </div>
          <SelectedFilters
            :options="selectedOptions"
            @selectFilterOption="selectFilterOption" />
        </div>
        <Divider
          v-if="displayChart"
          label="Search Results" />
        <Chart @refreshSlider="refreshSlider" />
        <Divider
          v-if="displayChart && displayTables"
          label="Results"
          text="The tables below show studies in suicidality grouped by estimators" />
        <!-- Since the result table is hidden behind a v-if and thus does not
        exist in the DOM right away, I am this div will act as a pointer to scroll
        to when selecting a result count value from the chart. -->
        <div class="scroll-to-here-when-clicking-on-chart" />
        <ResultTable v-if="displayTables" />
      </div>

    </div>

    <ModalAbout :class="{ visible: visible(2) }" />

    <ModalDefinitions :class="{ visible: visible(3) }" />

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'

import Filters from '@/components/Page_Home/Filters'
import Divider from '@/components/Page_Home/Divider'
import Chart from '@/components/Page_Home/Chart'
import ResultTable from '@/components/Page_Home/ResultTable'
import ModalHome from '@/components/modals/Home'
import ModalAbout from '@/components/modals/About'
import ModalDefinitions from '@/components/modals/Definitions'
import SelectedFilters from '@/components/Page_Home/SelectedFilters'

// =================================================================== Functions
const setSliderHeight = (instance, status, next) => {
  const slider = instance.$refs.slider
  const child = slider.children[instance.selectedSlide]
  if (status === 'init') {
    let num = 0
    let lastHeight = instance.height
    let height = instance.height
    const interval = setInterval(() => {
      if (num < 50) {
        const childHeight = child.clientHeight
        if (childHeight !== height) {
          instance.height = height
          height = childHeight
          lastHeight = height
          num = 0
        } else if (lastHeight === height) {
          num++
        }
      } else {
        instance.height = height
        if (next) { next() }
        clearInterval(interval)
      }
    }, 10)
  } else if (status === 'update') {
    instance.height = child.clientHeight
  }
}

// ====================================================================== Export
export default {
  name: 'PageSlider',

  components: {
    Filters,
    Divider,
    Chart,
    ResultTable,
    ModalHome,
    ModalAbout,
    ModalDefinitions,
    SelectedFilters
  },

  props: {
    selectedSlide: {
      type: [Number, Boolean],
      required: true
    }
  },

  data () {
    return {
      height: '0px',
      transition: false,
      resize: false,
      filters: 'query/filters'
    }
  },

  computed: {
    ...mapGetters({
      displayChart: 'result/displayChart',
      displayTables: 'result/displayTables',
      selectedFilterOptions: 'query/filterOptions'
    }),
    selectedOptions () {
      const options = this.selectedFilterOptions
      return Object.keys(options).length > 0 ? options : false
    }
  },

  watch: {
    selectedFilterOptions () {
      const timeout = setTimeout(() => {
        setSliderHeight(this, 'update')
        clearTimeout(timeout)
      }, 10)
    },
    selectedSlide (val) {
      if (!isNaN(val)) {
        setSliderHeight(this, 'update')
      }
    }
  },

  mounted () {
    this.height = window.innerHeight
    this.$nextTick(() => {
      setSliderHeight(this, 'init', () => {
        this.resize = () => { setSliderHeight(this, 'update') }
        window.addEventListener('resize', this.resize)
        this.transition = true
        this.$emit('loaded')
      })
    })
  },

  beforeDestroy () {
    if (this.resize) { window.removeEventListener('resize', this.resize) }
  },

  methods: {
    ...mapActions({
      addFilterOption: 'query/addFilterOption',
      clearFilterOptions: 'query/clearFilterOptions'
    }),
    visible (index) {
      const selected = this.selectedSlide
      if (!isNaN(selected)) {
        if (selected === index) { return true }
        return false
      }
      return false
    },
    refreshSlider () {
      setSliderHeight(this, 'init')
    },
    selectFilterOption (option) {
      this.addFilterOption(option)
    },
    filterDropdownToggled () {
      let num = 0
      const interval = setInterval(() => {
        if (num >= 100) { clearInterval(interval) }
        setSliderHeight(this, 'update')
        num++
      }, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
$filtersPanelWidth: 20rem;

// ////////////////////////////////////////////////////////////////////// Slider
.page-slider {
  position: relative;
  min-height: 100vh;
  z-index: 50;
  &.transition {
    min-height: auto;
    transition: height 250ms linear;
    > div {
      transition: 250ms linear;
      &.visible {
        transition: 250ms linear;
      }
    }
  }
  > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: -1;
    &.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
      z-index: 10;
    }
  }
}

// ////////////////////////////////////////////////// Selected Filters Container
.selected-filters-container {
  position: relative;
  background-color: $athensGray;
  border-bottom: 1px solid $borderColor;
  padding: 2rem;
  padding-bottom: 1.5rem;
  .label {
    text-transform: uppercase;
    font-size: 0.875rem;
    margin-right: 3rem;
  }
  .panel {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .clear-all-filters-button {
    @include label;
    &:hover {
      color: $electricViolet;
    }
  }
}

// ///////////////////////////////////////////////////////////////////// Content
.content-main {
  display: inline-flex !important;
  flex-direction: row;
  padding-left: calc((100vw - #{$containerWidth}) / 2 + 1rem);
}

.panel-left {
  position: relative;
  width: $filtersPanelWidth;
  border-left: 1px solid $borderColor;
  border-right: 1px solid $borderColor;
  z-index: 200;
  @include small {
    display: none;
  }
}

.panel-right {
  width: calc(100% - #{$filtersPanelWidth});
  @include small {
    width: 100%;
  }
}

.divider {
  padding-right: calc((100vw - #{$containerWidth}) / 2 + 1rem);
}

.chart {
  padding-right: calc((100vw - #{$containerWidth}) / 2 + 1rem);
  border-bottom: 1px solid $borderColor;
}
</style>
