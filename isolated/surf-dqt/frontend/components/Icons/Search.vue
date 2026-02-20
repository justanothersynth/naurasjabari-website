<template>
  <svg class="svg-icon search-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.28 17.47">

    <circle
      class="svg-circle search-svg-circle"
      cx="7.5"
      cy="7.5"
      r="6.5"
      :style="{ stroke, strokeWidth }" />

    <line
      class="svg-line search-svg-line"
      x1="13.26"
      y1="12.46"
      x2="17.28"
      y2="16.47"
      :style="{ stroke, strokeWidth }" />

  </svg>
</template>

<script>
export default {
  name: 'IconSearch',

  props: {
    stroke: {
      type: String,
      default: '#313131',
      required: false
    },
    strokeWidth: {
      type: String,
      default: '1.5px',
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
.svg-icon {
  display: block
}

.svg-circle,
.svg-line {
  fill: none;
}

.svg-circle {
  stroke-linecap: round;
}
</style>
