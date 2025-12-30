<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href || false"
    :class="['button-cta', type]"
    @click="clickHandler">

    <span class="text">{{ text }}</span>

    <div class="rings">
      <span class="ring"></span>
      <span class="ring"></span>
      <span class="ring"></span>
    </div>

  </component>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'ButtonCTA',

  props: {
    text: {
      type: String,
      required: true
    },
    type: { // block or transparent
      type: String,
      required: false,
      default: 'block'
    },
    href: {
      type: [Boolean, String],
      required: false,
      default: false
    }
  },

  methods: {
    clickHandler () {
      if (!this.href) {
        this.$emit('changeRoute')
        this.$scrollToTop(400)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$ringCount: 3;
$ringBlock_Offset: 0.1875rem;
$ringTransparent_Width: 4.5rem;
$ringTransparent_Offset: 0.4375rem;

// ///////////////////////////////////////////////////////////////////// General
.button-cta {
  font-size: 0.9375rem;
  font-weight: 700;
  color: $electricViolet;
  text-transform: uppercase;
  &:hover {
    .text {
      transition: 250ms ease-in;
    }
  }
  &.block {
    margin-top: calc(#{$ringBlock_Offset * 2 * 3} + 2rem);
    &:hover {
      .text {
        color: white;
        background-color: $electricViolet;
      }
      .ring {
        transition: 350ms ease-in;
        border-color: $electricViolet;
        @for $i from 1 through 3 {
          &:nth-child(#{$i}) {
            transition-delay: ($i - 1) * 100ms;
          }
        }
      }
    }
    .text {
      line-height: 1;
      padding: 1rem 1.5rem;
      background-color: $hawkesBlue;
      border-radius: 0.25rem;
    }
    .rings {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .ring {
      border-radius: 0.25rem;
      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          top: -$ringBlock_Offset * 2 * $i;
          left: -$ringBlock_Offset * 2 * $i;
          width: calc(100% + #{$ringBlock_Offset * $i * 4});
          height: calc(100% + #{$ringBlock_Offset * $i * 4});
        }
      }
    }
  }
  &.transparent {
    margin-top: 3rem;
    &:hover {
      .text {
        transform: scale(1.05);
      }
    }
    .rings {
      top: calc(50% - #{math.div($ringTransparent_Width, 2)});
      left: calc(50% - #{math.div($ringTransparent_Width, 2)});
      width: $ringTransparent_Width;
      height: $ringTransparent_Width;
    }
    .ring {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      &:first-child {
        transform: translate(#{-$ringTransparent_Offset}, #{$ringTransparent_Offset});
      }
      &:last-child {
        transform: translate(#{$ringTransparent_Offset}, #{-$ringTransparent_Offset});
      }
    }
  }
}

// //////////////////////////////////////////////////////////////////////// Text
.text {
  display: block;
  position: relative;
  z-index: 10;
  transition: 250ms ease-out;
}

// /////////////////////////////////////////////////////////////////////// Rings
.rings {
  position: absolute;
  z-index: 5;
}

.ring {
  position: absolute;
  border: 2px solid $hawkesBlue;
  transition: 250ms ease-out;
}
</style>
