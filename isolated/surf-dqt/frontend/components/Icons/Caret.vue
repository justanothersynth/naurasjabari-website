<template>
  <svg class="svg-icon caret-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.48 5.24">

    <line
      class="svg-line caret-svg-line"
      x1="1"
      y1="1"
      x2="4.24"
      y2="4.24"
      :style="{ stroke, strokeWidth }" />

    <line
      class="svg-line caret-svg-line"
      x1="7.48"
      y1="1"
      x2="4.24"
      y2="4.24"
      :style="{ stroke, strokeWidth }" />

  </svg>
</template>

<script>
export default {
  name: 'IconCaret',

  props: {
    stroke: {
      type: String,
      default: '#313131',
      required: false
    },
    strokeWidth: {
      type: String,
      default: '2',
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
.svg-icon {
  display: block
}

.svg-line {
  fill: none;
  stroke-linecap: round;
}
</style>
