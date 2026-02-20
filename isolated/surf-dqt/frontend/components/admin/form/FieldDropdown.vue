<template>
  <div :class="['field-dropdown border validation', state]">

    <button
      :class="['value', { placeholder: !value }]"
      @click="toggleDropdown">
      {{ value || placeholder }}
    </button>

    <div :class="['dropdown', { open: dropdownOpen }]">
      <FilterBar
        :filter-value="filterValue"
        placeholder="Type to find"
        @setFilterValue="setFilterValue" />
      <div v-if="filtered" class="options-container">
        <button
          v-for="(option, index) in filtered"
          :key="index"
          :class="['option', { selected: selected(option) }]"
          @click="selectOption(option)">
          {{ option[optionsKey] }}
        </button>
      </div>
      <div v-else class="none-found-placeholder">
        No items found
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import FilterBar from '@/components/FilterBar'

// ====================================================================== Export
export default {
  name: 'FieldDropdown',

  components: {
    FilterBar
  },

  props: {
    placeholder: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    optionsKey: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      filterValue: '',
      dropdownOpen: false
    }
  },

  computed: {
    filtered () {
      const filterValue = this.filterValue.toLowerCase()
      const options = this.options
      const key = this.optionsKey
      const filtered = options.filter((obj) => {
        const value = obj[key] ? obj[key].toLowerCase() : ''
        if (value.includes(filterValue)) { return obj }
        return false
      })
      if (filtered.length === 0) { return false }
      return filtered
    }
  },

  methods: {
    toggleDropdown () {
      this.dropdownOpen = !this.dropdownOpen
    },
    selected (option) {
      return option[this.optionsKey] === this.value
    },
    selectOption (option) {
      this.$emit('updateValue', option[this.optionsKey])
      this.toggleDropdown()
    },
    setFilterValue (value) {
      this.filterValue = value
    }
  }
}
</script>

<style lang="scss" scoped>
$height: 2.5rem;

// ///////////////////////////////////////////////////////////////////// General
.field-dropdown {
  position: relative;
  width: 100%;
  height: 2.5rem;
}

// /////////////////////////////////////////////////////////////////////// Value
.value {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  color: inherit;
  padding: 0 0.875rem;
  &:hover {
    text-decoration: underline;
  }
  &:focus {
    box-shadow: 0 0 4px 0 #0A14E6;
    border-radius: 0.25rem;
  }
  &.placeholder {
    opacity: 0.5;
  }
}

// //////////////////////////////////////////////////////////////////// Dropdown
.dropdown {
  @include shadow2;
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  height: $height * 5.5;
  background-color: white;
  border-radius: 0.25rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
  &.open {
    opacity: 1;
    visibility: visible;
    pointer-events: all;
    z-index: 100;
  }
}

.options-container {
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  padding-top: $height;
  z-index: 5;
}

.option {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: $height;
  padding: 0 0.875rem;
  color: inherit;
  &:hover {
    color: $electricViolet;
  }
  &.selected {
    background-color: $electricViolet;
    color: white;
  }
}

// /////////////////////////////////////////////////////////////////// FilterBar
::v-deep .filter-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: $height;
  border-bottom: 2px solid $gray100;
  background-color: white;
  z-index: 10;
  overflow: hidden;
  &.focused {
    .icon-container {
      background-color: $gray400;
    }
    .input {
      border-color: $gray400;
    }
  }
  .input {
    border-radius: 0;
    width: 100%;
  }
  .icon-container {
    background-color: $gray100;
  }
  .search-icon {
    width: 0.75rem;
  }
}

.none-found-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
  padding-top: calc(#{$height} + 2rem);
}
</style>
