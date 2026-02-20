<template>
  <div class="field-input-predictive">

    <input
      v-if="!disabled"
      ref="input"
      v-click-outside="closeDropdown"
      type="text"
      :class="['input border validation', state, { disabled }]"
      :placeholder="placeholder"
      :value="value"
      @input="$emit('updateValue', $event.target.value)"
      @focus="openDropdown" />

    <div
      v-else
      :class="['input border validation', state, { disabled }]"
      type="text">
      {{ value || placeholder }}
    </div>

    <div :class="['dropdown', { open: dropdownOpen }]">
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
// =================================================================== Functions
const preValidate = (instance, value, pre) => {
  if (typeof pre !== 'string') { return }
  const regex = new RegExp(pre)
  if (regex.test(value)) { // value contains restricted characters
    const stripped = value.replace(regex, '')
    instance.$emit('updateValue', stripped)
  }
}

// ====================================================================== Export
export default {
  name: 'FieldInputPredictive',

  props: {
    placeholder: {
      type: String,
      required: false,
      default: 'Enter a value'
    },
    value: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    optionsKey: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    pre: {
      type: [String, Boolean],
      required: false,
      default: false
    }
  },

  data () {
    return {
      dropdownOpen: false
    }
  },

  computed: {
    filtered () {
      const filterValue = this.value.toLowerCase()
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

  watch: {
    value (value) {
      preValidate(this, value, this.pre)
    }
  },

  methods: {
    openDropdown () {
      this.dropdownOpen = true
    },
    closeDropdown () {
      this.dropdownOpen = false
    },
    selected (option) {
      return option[this.optionsKey] === this.value
    },
    selectOption (option) {
      this.$emit('updateValue', option[this.optionsKey])
      this.closeDropdown()
    }
  }
}
</script>

<style lang="scss" scoped>
$height: 2.5rem;

// ///////////////////////////////////////////////////////////////////// General
.field-input-predictive {
  position: relative;
}

.input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.875rem;
  &.disabled {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

// //////////////////////////////////////////////////////////////////// Dropdown
.dropdown {
  @include shadow2;
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  max-height: $height * 5.5;
  background-color: white;
  color: black;
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
    overflow-y: scroll;
    z-index: 100;
  }
}

.options-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
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

// ///////////////////////////////////////////////////////////////// Placeholder
.none-found-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: $height * 2;
  padding: 2rem;
}
</style>
