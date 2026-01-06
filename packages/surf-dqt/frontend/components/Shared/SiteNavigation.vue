<template>
  <nav class="navigation">

    <button
      v-for="(link, index) in links"
      ref="menuItem"
      :key="link.id"
      :class="['menu-item', { active: selected(index) }]"
      @click="$emit('changeRoute', link.metadata.link)">
      {{ link.value }}
    </button>

    <div
      class="lava-lamp-slider"
      :style="{ width: lavaLampWidth, left: lavaLampLeft }"></div>

  </nav>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

// =================================================================== Functions
const setLavaLampSlider = (instance) => {
  if (typeof instance.selectedSlide === 'number') {
    const menuItems = instance.$refs.menuItem
    const item = menuItems[instance.selectedSlide]
    const parentX = item.parentNode.getBoundingClientRect().x
    instance.lavaLampLeft = item.getBoundingClientRect().x - parentX + 'px'
    instance.lavaLampWidth = item.clientWidth + 'px'
  }
}

// ====================================================================== Export
export default {
  name: 'SiteHeader',

  props: {
    selectedSlide: {
      type: [Number, Boolean],
      required: true
    },
    hideNav: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      lavaLampLeft: '0px',
      lavaLampWidth: '0px',
      resize: false
    }
  },

  computed: {
    ...mapGetters({
      siteContent: 'admin/siteContent'
    }),
    content () {
      return this.siteContent['site-header']
    },
    links () {
      return [
        this.content.section_3_link_1,
        this.content.section_3_link_2,
        this.content.section_3_link_3,
        this.content.section_3_link_4
      ]
    }
  },

  watch: {
    selectedSlide (val) {
      if (!isNaN(val)) {
        setLavaLampSlider(this)
      }
    }
  },

  mounted () {
    const links = this.links
    const len = links.length
    const indices = []
    for (let i = 0; i < len; i++) {
      indices.push({ index: i, tag: links[i].metadata.link })
    }
    this.$emit('setIndices', indices)
    const resizeHandler = () => {
      const timeout = setTimeout(() => {
        setLavaLampSlider(this)
        clearTimeout(timeout)
      }, 100)
    }
    if (!isNaN(this.selectedSlide)) { resizeHandler() }
    this.resize = this.$throttle(resizeHandler, 100)
    window.addEventListener('resize', this.resize)
  },

  beforeDestroy () {
    if (this.resize) { window.removeEventListener('resize', this.resize) }
  },

  methods: {
    selected (index) {
      const selected = this.selectedSlide
      if (!isNaN(selected)) {
        if (selected === index) { return true }
        return false
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.navigation {
  display: flex;
  flex-direction: row;
  position: relative;
  border-bottom: 1px solid $borderColor;
}

// ////////////////////////////////////////////////////////////////// Menu Items
.menu-item {
  position: relative;
  padding: 1rem 0;
  margin: 0 2rem;
  margin-bottom: -1px;
  white-space: nowrap;
  border-bottom: 1px solid $borderColor;
  @include mini {
    padding: 0.5rem 0;
    margin: 0 1rem;
    font-size: 0.75rem;
  }
  &:hover {
    &:after {
      transition: 250ms ease-out;
      transform: scaleY(2) translateY(-50%);
    }
  }
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 1px;
    width: 100%;
    opacity: 0.2;
    background-color: $mineShaft;
    transform: scaleY(0);
    transition: 250ms ease-out;
  }
  &:first-child {
    margin-left: 0;
  }
  &:nth-last-child(2) {
    margin-right: 0;
  }
}

// //////////////////////////////////////////////////////////// Lava Lamp Slider
.lava-lamp-slider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0px;
  height: 2px;
  background-color: $mineShaft;
  pointer-events: none;
  transition: 600ms ease-in-out;
}
</style>
