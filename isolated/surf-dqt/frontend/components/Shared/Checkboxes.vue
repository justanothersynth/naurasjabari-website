<template>
  <div class="checkboxes">

    <div
      v-for="item in checkboxes"
      :key="item.id"
      :class="['checkbox', selected(item.id) ? 'selected' : '']"
      @click="selectCheckbox(item)">
      <div class="tooltip">
        {{ item.name }}
      </div>
      <div class="selection-indicator"></div>
      <div class="label">
        {{ item.label }}
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'

// ====================================================================== Export
export default {
  name: 'Checkboxes',

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

  computed: {
    ...mapGetters({
      selectedFilterOptions: 'query/filterOptions'
    }),
    checkboxes () {
      return this.filter.definitions
    }
  },

  methods: {
    selectCheckbox (checkbox) {
      this.$emit('selectFilterOption', {
        parent: Object.assign(checkbox, {
          type: this.filter.type,
          filter: this.filterDatabaseKey,
          match: this.filter.match
        }),
        child: false
      })
    },
    selected (id) {
      return this.selectedFilterOptions.hasOwnProperty(id)
    }
  }
}
</script>

<style lang="scss" scoped>
// ////////////////////////////////////////////////////////////////// Checkboxes
.checkboxes {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.checkbox {
  display: flex;
  flex-direction: row;
  position: relative;
  margin-right: 1.25rem;
  margin-bottom: 1.25rem;
  width: calc(33.333% - 0.8333rem);
  cursor: pointer;
  &:hover {
    .tooltip {
      transition: 250ms ease-in;
      opacity: 1;
      transform: translateX(0);
      visibility: visible;
      z-index: 10;
    }
    .selection-indicator {
      &:before {
        border-color: $electricViolet;
        opacity: 0.5;
      }
      &:after {
        transition: 250ms ease-in;
        opacity: 0.5;
      }
    }
  }
  &:nth-child(3n) {
    margin-right: 0;
  }
  &.selected {
    .selection-indicator {
      &:after {
        transition: 250ms ease-in;
        opacity: 1;
      }
    }
  }
}

// ///////////////////////////////////////////////////////////////////// Tooltip
.tooltip {
  @include shadow5;
  position: absolute;
  top: -0.25rem;
  left: calc(1rem + 0.5rem);
  padding: 0.25rem 0.5625rem;
  border-radius: 0.1875rem;
  background-color: white;
  font-size: 0.75rem;
  opacity: 0;
  transform: translateX(1rem);
  visibility: hidden;
  z-index: -1;
  white-space: nowrap;
  pointer-events: none;
  transition: 250ms ease-out;
}

// ///////////////////////////////////////////////////////// Selection Indicator
.selection-indicator {
  position: relative;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.25rem;
    overflow: hidden;
    transition: 250ms ease-out;
  }
  &:before {
    border: 1px solid $mineShaft;
    z-index: 5;
  }
  &:after {
    opacity: 0;
    border: 1px solid $mineShaft;
    background-color: $mineShaft;
    z-index: 10;
  }
}

.label {
  flex: 1;
  font-size: 0.75rem;
  text-transform: uppercase;
}
</style>
