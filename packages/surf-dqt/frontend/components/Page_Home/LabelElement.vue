<template>
  <div :class="['label', { center, large, 'rings-visible': rings }, `margin-bottom-${marginBottom}`]">

    <span class="text">{{ text }}</span>

    <div class="rings">
      <span class="ring"></span>
      <span class="ring"></span>
      <span class="ring"></span>
    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'LabelElement',

  props: {
    text: {
      type: String,
      required: true
    },
    center: {
      type: Boolean,
      required: false,
      default: false
    },
    large: {
      type: Boolean,
      required: false,
      default: false
    },
    rings: {
      type: Boolean,
      required: false,
      default: false
    },
    marginBottom: {
      type: String, // large (1.75rem), small (0.5rem)
      required: false,
      default: 'large'
    }
  }
}
</script>

<style lang="scss" scoped>
$ringWidth: 6rem;
$ringoffset: 0.4375rem;

// ///////////////////////////////////////////////////////////////////// General
.label {
  position: relative;
  &.large {
    font-size: 1.125rem;
  }
  &.center {
    text-align: center;
  }
  &.rings-visible {
    .rings {
      display: block;
    }
  }
  &.margin-bottom-large {
    margin-bottom: 1.75rem;
  }
  &.margin-bottom-small {
    margin-bottom: 0.5rem;
  }
}

.text {
  position: relative;
  font-size: 0.9375rem;
  font-weight: 700;
  color: $electricViolet;
  text-transform: uppercase;
  z-index: 10;
}

// /////////////////////////////////////////////////////////////////////// Rings
.rings {
  display: none;
  position: absolute;
  top: -3.5rem;
  left: -4rem;
  width: $ringWidth;
  height: $ringWidth;
  z-index: 5;
}

.ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid white;
  &:first-child {
    transform: translate(#{-$ringoffset}, #{$ringoffset});
  }
  &:last-child {
    transform: translate(#{$ringoffset}, #{-$ringoffset});
  }
}
</style>
