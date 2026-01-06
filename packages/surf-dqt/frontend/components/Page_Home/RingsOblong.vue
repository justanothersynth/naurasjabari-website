<template>
  <div ref="ringsOblong" :class="['rings-oblong', orientation, colour]">

    <div
      v-for="(depth, index) in ringContainers"
      :key="index"
      :class="['ring-container', `offset-${orientation}`]"
      :data-depth="depth">
      <span class="ring"></span>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import Parallax from 'parallax-js'

// ====================================================================== Export
export default {
  name: 'RingsOblong',

  props: {
    orientation: { // vertical or horizontal
      type: String,
      required: false,
      default: 'vertical'
    },
    colour: { // white or violet
      type: String,
      required: false,
      default: 'violet'
    }
  },

  data () {
    return {
      ringContainers: [-1, 0, 1]
    }
  },

  mounted () {
    const scene = this.$refs.ringsOblong
    /* eslint-disable-next-line */
    new Parallax(scene)
  }
}
</script>

<style lang="scss" scoped>
$long: 27rem;
$short: 8.5rem;
$ringOffset: 1rem;

// ///////////////////////////////////////////////////////////////////// General
.rings-oblong {
  position: absolute;
  z-index: 5;
  &.vertical {
    width: $short;
    height: $long;
  }
  &.horizontal {
    width: $long;
    height: $short;
  }
  &.white {
    .ring {
      border-color: white;
    }
  }
  &.violet {
    .ring {
      border-color: $hawkesBlue;
    }
  }
  &.gray {
    .ring {
      border-color: $wildSand;
    }
  }
}

.ring-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  &.offset-vertical {
    &:first-child {
      .ring {
        transform: translateX(#{$ringOffset});
      }
    }
    &:last-child {
      .ring {
        transform: translateX(#{-$ringOffset});
      }
    }
  }
  &.offset-horizontal {
    &:first-child {
      .ring {
        transform: translateY(#{$ringOffset});
      }
    }
    &:last-child {
      .ring {
        transform: translateY(#{-$ringOffset});
      }
    }
  }
}

.ring {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 5rem;
  border: 2px solid;
}
</style>
