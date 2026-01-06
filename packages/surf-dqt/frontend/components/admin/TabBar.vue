<template>
  <div :class="['tab-bar', `orientation__${orientation}`]">

    <button
      v-for="tab in tabs"
      :key="tab.slug"
      :class="{ selected: isSelected(tab.slug) }"
      @click="changeTab(tab.slug)">
      {{ tab.label }}
    </button>

    <template v-if="orientation === 'horizontal'">
      <div class="divider" />
      <a
        :href="filesZipDownloadLink"
        :download="filesZipDownloadLink"
        class="file-download-button">
        Download Files
      </a>
    </template>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'PageAdmin',

  props: {
    tabs: {
      type: Array,
      required: true
    },
    activeTab: {
      type: String,
      required: true
    },
    orientation: {
      type: String,
      required: false,
      default: 'horizontal'
    }
  },

  computed: {
    filesZipDownloadLink () {
      return `${this.$config.backendUrl}/surf-dataquery-files.zip`
    }
  },

  methods: {
    isSelected (slug) {
      return this.activeTab === slug
    },
    changeTab (slug) {
      this.$emit('changeTab', slug)
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.tab-bar {
  display: flex;
  border-bottom: 1px solid $whisper;
  overflow: hidden;
}

.orientation__horizontal {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  width: 100%;
  height: $adminSiteHeaderHeight;
  padding: 1rem;
  background-color: $athensGray;
  z-index: 1000;
  button {
    &:not(:last-child) {
      margin-right: 1rem;
    }
  }
}

.orientation__vertical {
  flex-direction: column;
  align-items: flex-end;
  width: 15rem;
  padding: 1rem;
  border-right: 1px solid $whisper;
  button {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}

button {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: $electricViolet;
  border-radius: 0.25rem;
  border: 1px solid $whisper;
  &:not(.selected) {
    &:hover {
      text-decoration: underline;
    }
  }
  &.selected {
    color: white;
    background-color: $electricViolet;
    border-color: $electricViolet;
    cursor: default;
  }
}

.divider {
  width: 2px;
  height: 1.5rem;
  background-color: $whisper;
  margin-right: 0.625rem;
}

.file-download-button {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: $electricViolet;
  &:hover {
    text-decoration: underline;
  }
}
</style>
