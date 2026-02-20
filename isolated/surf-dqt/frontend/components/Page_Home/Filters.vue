<template>
  <div class="filters">

    <div class="heading">
      <div class="client-label">
        Filters
      </div>
      <div class="client-sublabel">
        Select all that apply
      </div>
    </div>

    <div
      class="dropdown-multiple-container"
      :style="{ height: filtersPanelHeight }">
      <template v-for="(filter, key, index) in filters">
        <Dropdown
          v-if="filter.type === 'dropdown-multiple'"
          ref="dropdownMultiple"
          :key="filter.id"
          :filter="filter"
          :filter-key="key"
          :filter-database-key="filter.key"
          :index="index"
          :selected-dropdown-multiple="selectedDropdownMultiple"
          class="filter dropdown-multiple"
          @setFiltersPanelListWrapperHeight="setFiltersPanelListWrapperHeight"
          @selectFilterOption="selectFilterOption"
          @setDropdownMultiple="setDropdownMultiple" />
      </template>
    </div>

    <div class="range-slider-container">
      <label class="label">Year</label>
      <label class="sublabel">Filter by single year or by range</label>
      <template v-if="filters.year">
        <YearSingleSelector
          :filter="filters.year"
          :filter-database-key="filters.year.key"
          filter-key="year"
          class="filter year-single-selector"
          @selectFilterOption="selectFilterOption" />
        <RangeSlider
          :filter="filters.year"
          :filter-database-key="filters.year.key"
          filter-key="year"
          class="filter range-slider"
          @selectFilterOption="selectFilterOption" />
      </template>
    </div>

    <div class="estimators-size-effect-container">

      <div class="checkboxes-container">
        <label class="label">Estimators</label>
        <label class="sublabel">Some estimators may not be compared</label>
        <Checkboxes
          v-if="filters.estimator"
          :filter="filters.estimator"
          :filter-database-key="filters.estimator.key"
          filter-key="estimator"
          class="filter checkboxes"
          @selectFilterOption="selectFilterOption" />
      </div>

      <div class="range-slider-container">
        <label class="label">Size Effect</label>
        <RangeSlider
          v-if="filters['size-effect']"
          :filter="filters['size-effect']"
          :filter-database-key="filters['size-effect'].key"
          filter-key="sizeEffect"
          class="filter range-slider"
          @selectFilterOption="selectFilterOption" />
      </div>

    </div>

    <div class="heading">
      <div class="client-label">
        Legend
      </div>
    </div>

    <div class="legend outcome">
      <div class="label">
        Outcome
      </div>
      <div
        v-for="(value, key) in legends.outcome"
        :key="`legend-outcome-${key}`"
        class="entry">
        <div class="key">
          {{ key }}
        </div>
        <div class="value">
          {{ value }}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'

import Dropdown from '@/components/Shared/Dropdown'
import RangeSlider from '@/components/Shared/RangeSlider'
import Checkboxes from '@/components/Shared/Checkboxes'
import YearSingleSelector from '@/components/Page_Home/YearSingleSelector'

// =================================================================== Functions
const setDropdownsHeight = (instance, status) => {
  const dropdowns = instance.$refs.dropdownMultiple
  const len = dropdowns.length
  let height = 0
  for (let i = 0; i < len; i++) {
    height += dropdowns[i].$el.clientHeight
  }
  if (status === 'open') {
    instance.filtersPanelHeight = (height / 16) + instance.filtersPanelListWrapperHeight + 'rem'
  } else if (status === 'closed') {
    instance.filtersPanelHeight = (height / 16) + 'rem'
  }
}

// ====================================================================== Export
export default {
  name: 'Filters',

  components: {
    Dropdown,
    RangeSlider,
    Checkboxes,
    YearSingleSelector
  },

  data () {
    return {
      filtersPanelHeight: '0px',
      filtersPanelListWrapperHeight: 0,
      selectedDropdownMultiple: -1,
      legends: {
        outcome: {
          SC: 'Suicide completion',
          SA: 'Suicide attempt',
          SI: 'Suicide ideation',
          DSH: 'Deliberate Self Harm',
          SH: 'Self Harm',
          SB: 'Suicidal behaviour',
          ST: 'Suicidal thoughts',
          SP: 'Suicidal planning',
          STB: 'Suicidal thoughts and behaviours'
        }
      }
    }
  },

  computed: {
    ...mapGetters({
      filters: 'query/filters'
    })
  },

  mounted () {
    this.$nextTick(() => {
      setDropdownsHeight(this, 'closed')
    })
  },

  methods: {
    ...mapActions({
      addFilterOption: 'query/addFilterOption'
    }),
    setFiltersPanelListWrapperHeight (height) {
      this.filtersPanelListWrapperHeight = height
    },
    selectFilterOption (payload) {
      this.addFilterOption(payload)
    },
    setDropdownMultiple (index) {
      if (this.selectedDropdownMultiple === index) {
        this.selectedDropdownMultiple = -1
        setDropdownsHeight(this, 'closed')
      } else {
        this.selectedDropdownMultiple = index
        setDropdownsHeight(this, 'open')
      }
      this.$emit('filterDropdownToggled')
    }
  }
}
</script>

<style lang="scss" scoped>
$padding: 2rem;
$applyFiltersButtonHeight: 3rem;

// ///////////////////////////////////////////////////////////////////// General
.filters {
  position: relative;
  padding-bottom: $applyFiltersButtonHeight;
  z-index: 100;
}

.grid {
  margin-bottom: 2rem;
}

// ///////////////////////////////////////////////////////////////////// Heading
.heading {
  padding: $padding;
  border-bottom: 1px solid $borderColor;
  background-color: rgba($coldPurple, 0.05);
  &:not(:first-child) {
    border-top: 1px solid $borderColor;
  }
}

// ///////////////////////////////////////////////////////////////////// Filters
.range-slider-container,
.estimators-size-effect-container {
  position: relative;
  background-color: $athensGray;
  border-top: 1px solid $borderColor;
}

.label {
  text-transform: uppercase;
  font-size: 0.875rem;
}

.sublabel {
  font-size: 0.75rem;
  font-style: italic;
  margin-top: -$padding;
  margin-bottom: $padding;
  opacity: 0.75;
  color: $mineShaft2;
}

.range-slider-container,
.checkboxes-container {
  padding: $padding;
}

.range-slider-container,
.checkboxes-container {
  .label {
    margin-bottom: $padding;
  }
}

.year-single-selector {
  margin-top: -1rem;
  margin-bottom: 2rem;
}

.dropdown-multiple-container {
  transition: height 250ms ease-in;
}

.range-slider-container {
  padding-bottom: $padding * 2;
  z-index: 5;
}

.estimators-size-effect-container {
  z-index: 10;
  .range-slider-container {
    border-top: 0;
    padding-top: 0;
  }
}

// ///////////////////////////////////////////////////////////////////// Legends
.legend {
  padding: 2rem;
  .label {
    margin-bottom: 1rem;
  }
  .entry {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  .key,
  .value {
    font-size: 14px;
  }
  .key {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: 700;
    &:after {
      content: '';
      flex: 1;
      min-width: 3rem;
      height: 0.25rem;
      margin: 0 0.25rem;
      background-image: radial-gradient(circle, currentcolor 1px, transparent 1px);
      background-size: 0.5rem 0.25rem;
      background-repeat: space no-repeat;
      opacity: 0.25;
    }
  }
}
</style>
