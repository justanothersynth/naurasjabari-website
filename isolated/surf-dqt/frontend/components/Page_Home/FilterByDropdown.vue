<template>
  <div class="filter-by-dropdown">

    <span class="label">View By</span>

    <div class="dropdown">

      <div
        :class="['selected', { 'dropdown-open': dropdownOpen }]"
        @click="toggleDropdown()">
        <span class="text">{{ selected }}</span>
        <div class="chevron"></div>
      </div>

      <ul :class="['options', { open: dropdownOpen }]">
        <li
          v-for="option in options"
          :key="option.key"
          class="option"
          @click="selectOption(option.key, option.databaseKey, option.name)">
          {{ option.name }}
        </li>
      </ul>

    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'FilterByDropdown',

  props: {
    filterBy: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      dropdownOpen: false,
      options: [
        { name: 'Population', key: 'population', databaseKey: 'populationPrimary' },
        { name: 'Country', key: 'country', databaseKey: 'country' },
        { name: 'Risk Factor', key: 'risk-factor', databaseKey: 'riskFactorCategory' },
        { name: 'Author', key: 'first-author', databaseKey: 'firstAuthor' },
        { name: 'Year', key: 'year', databaseKey: 'year' }
      ]
    }
  },

  computed: {
    selected () {
      const options = this.options
      const selected = options.find(obj => obj.key === this.filterBy)
      return selected.name
    }
  },

  methods: {
    toggleDropdown () {
      this.dropdownOpen = !this.dropdownOpen
    },
    selectOption (key, databaseKey, name) {
      this.$emit('selectFilterBy', { key, databaseKey, name })
      this.toggleDropdown(false)
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.filter-by-dropdown {
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 200;
}

// /////////////////////////////////////////////////////////////////////// Label
.label {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 0.25rem;
}

// //////////////////////////////////////////////////////////////////// Dropdown
.dropdown {
  position: relative;
}

.label,
.selected,
.option {
  text-transform: uppercase;
}

.option,
.selected {
  font-size: 0.75rem;
}

.label {
  position: absolute;
  bottom: calc(100% + 1px);
  left: 0.4375rem;
  font-size: 0.625rem;
}

.selected {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 700;
  line-height: 1;
  padding: 0.125rem 0.375rem 0.125rem 0.375rem;
  cursor: pointer;
  border-radius: 0.125rem;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    background-color: white;
  }
  &.dropdown-open {
    .chevron {
      &:before {
        transition: 250ms ease-out;
        transform: rotate(-45deg);
      }
    }
  }
}

.chevron {
  width: 1rem;
  &:before {
    content: '';
    display: inline-block;
    border-style: solid;
    border-width: 0.125rem 0.125rem 0 0;
    width: 0.375em;
    height: 0.3125rem;
    position: relative;
    top: -0.125em;
    left: 0.375rem;
    transform: rotate(135deg);
    transition: 250ms ease-out;
  }
}

.options {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background-color: white;
  transform: translateY(1rem);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
  transition: 250ms ease-out;
  &.open {
    transition: 250ms ease-in;
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    pointer-events: all;
    z-index: 10;
  }
}

.option {
  padding: 0.5rem;
  white-space: nowrap;
  cursor: pointer;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    background-color: $borderColor;
  }
  &:not(:last-child) {
    border-bottom: 1px solid $borderColor;
  }
}
</style>
