<template>
  <div class="slider-container">

    <div ref="slider" class="slider"></div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapActions } from 'vuex'

import CloneDeep from 'lodash/cloneDeep'

// =================================================================== Functions
const getTooltip = (val, direction) => {
  if (direction === 'floor') {
    return Math.floor(val)
  } else if (direction === 'ceil') {
    return Math.ceil(val)
  } else {
    return Number.isInteger(val) ? val : Math.round((val + Number.EPSILON) * 100) / 100
  }
}

// ====================================================================== Export
export default {
  name: 'RangeSlider',

  props: {
    filter: {
      type: Object,
      required: true
    },
    filterKey: {
      type: String,
      required: true
    },
    filterDatabaseKey: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      id: 'year-range-slider',
      slider: null
    }
  },

  mounted () {
    const options = CloneDeep(this.filter.options).sort((a, b) => { return a.name - b.name })
    const len = options.length
    const min = parseFloat(options[0].name)
    const max = parseFloat(options[len - 1].name)
    this.slider = window.noUiSlider.create(this.$refs.slider, {
      start: [min, max],
      connect: true,
      tooltips: [
        { to: (val) => { return getTooltip(val, 'floor') } },
        { to: (val) => { return getTooltip(val, 'ceil') } }
      ],
      step: 1,
      margin: 1,
      range: {
        min,
        max
      }
    })
    this.slider.on('end', (values) => {
      this.removeFilterOption('year-single-selector')
      this.$emit('selectFilterOption', {
        parent: {
          id: this.id,
          type: this.filter.type,
          filter: this.filterDatabaseKey,
          match: this.filter.match,
          min: values[0],
          max: values[1]
        },
        child: false,
        replace: true
      })
    })
  },

  methods: {
    ...mapActions({
      removeFilterOption: 'query/removeFilterOption'
    })
  }
}
</script>

<style lang="scss" scoped>
$sliderLineHeight: 1px;

// ///////////////////////////////////////////////////////////////////// General
.slider-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

// ////////////////////////////////////////////////////////////////////// Slider
.slider {
  width: 100%;
  border: 0;
  box-shadow: none;
  height: $sliderLineHeight;
  background-color: $borderColor;
  ::v-deep .noUi-handle {
    top: -3px;
    border: 0;
    box-shadow: none;
    width: 3px;
    height: 7px;
    background-color: $mineShaft;
    cursor: move;
    cursor: grab;
    border-radius: 0;
    &:before,
    &:after {
      display: none;
    }
    &:active {
      cursor: grabbing;
    }
    &.noUi-handle-lower {
      left: 1.5rem;
    }
    &.noUi-handle-upper {
      right: 0;
    }
  }
  ::v-deep .noUi-connects {
    overflow: visible;
  }
  ::v-deep .noUi-connect {
    height: 3px;
    top: -1px;
    background-color: $mineShaft;
  }
  ::v-deep .noUi-tooltip {
    background: transparent;
    border: 0;
    color: $mineShaft;
    bottom: auto;
    top: 16px;
    font-size: 0.75rem;
  }
}
</style>
