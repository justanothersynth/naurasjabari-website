<template>
  <div
    :class="['dropdown', { 'dropdown-open': selectedFilter() }]"
    :style="{ transform: 'translateY(' + translateAmount() + 'rem)' }">

    <div
      :class="['display', { 'dropdown-open': selectedFilter() }]"
      @click="selectDropdownMultiple()">
      <label class="label">{{ label }}</label>
      <div class="chevron down"></div>
    </div>

    <div class="search-input-container">
      <IconSearch />
      <input
        ref="search-input"
        v-model="searchText"
        type="text"
        class="search-input"
        placeholder="Search for something here" />
    </div>

    <div :class="['list-wrapper', { 'dropdown-open': selectedFilter() }]">
      <div ref="listContainer" class="list">
        <div v-if="populatedDrodownItems">
          <template v-for="(item, dropdownItemIndex) in populatedDrodownItems">
            <div
              :key="dropdownItemIndex"
              class="list-item"
              @click="selectFilterOption($event, item)">
              <div :class="['selector primary', { 'has-sibling-dropdown': item.matches, 'dropdown-inner-open': selectedDropdownInner(item.id), selected: selectedOption(item), 'suboption-selected': selectedSubOptions(item) }]">
                <div class="selection-indicator"></div>
                <div class="name">
                  {{ item.name || item.category }}
                </div>
                <button
                  v-if="item.matches"
                  class="dropdown-inner-dropdown-button"
                  @click="selectDropdownInner($event, item.id, 'dropdown-inner-dropdown-button')">
                  <div class="chevron down"></div>
                </button>
              </div>
              <div
                :style="{ height: selectedDropdownInner(item.id) ? dropdownInnerHeight : '0px' }"
                class="dropdown-inner">
                <div class="dropdown-inner-wrapper">
                  <div
                    v-for="(subItem, subItemIndex) in item.matches"
                    :key="subItemIndex"
                    :class="['selector secondary', { selected: selectedOption(subItem) }]"
                    @click="selectFilterOption($event, item, subItem)">
                    <div class="selection-indicator"></div>
                    <div class="name">
                      {{ subItem.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div v-else class="placeholder">
          No items found.
          <br />
          Try another search term.
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'
import CloneDeep from 'lodash/cloneDeep'

import IconSearch from '@/components/Icons/Search'

// =================================================================== Functions
const populateDropdownItems = (instance) => {
  instance.dropdownItems = instance.filteredDropdownItems.slice(0, instance.dropdownItemsSliceIndex)
}

const scrollUpdate = (instance) => {
  const scrollTop = instance.listContainer.scrollTop
  const height = instance.listContainer.clientHeight
  const scrollHeight = instance.listContainer.scrollHeight
  const len = instance.dropdownItems.length
  if (instance.dropdownItemsSliceIndex > len) {
    instance.listContainer.removeEventListener('scroll', instance.scroll)
  }
  if ((scrollTop + height) >= scrollHeight) {
    instance.dropdownItemsSliceIndex += 20
  }
  if (len !== instance.dropdownItemsSliceIndex) {
    populateDropdownItems(instance)
  }
}

// ====================================================================== Export
export default {
  name: 'Dropdown',

  components: {
    IconSearch
  },

  props: {
    selectedDropdownMultiple: {
      type: Number,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
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

  data () {
    return {
      searchText: '',
      listWrapperHeight: 35,
      dropdownItems: [],
      dropdownItemsSliceIndex: 20,
      listContainer: null,
      scroll: false,
      dropdownInner: false,
      dropdownInnerHeight: false
    }
  },

  computed: {
    ...mapGetters({
      selectedFilterOptions: 'query/filterOptions'
    }),
    label () {
      return this.filterKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    },
    filteredDropdownItems () {
      const options = this.filter.options
      const searchText = this.searchText.toLowerCase()
      const filtered = options.filter((obj) => {
        if (obj.hasOwnProperty('category')) {
          return obj.category.toLowerCase().includes(searchText) || obj.matches.find(obj => obj.name.toLowerCase().includes(searchText))
        } else {
          return obj.name.toLowerCase().includes(searchText)
        }
      })
      return filtered
    },
    populatedDrodownItems () {
      const items = this.dropdownItems
      if (items.length > 0) { return items }
      return false
    }
  },

  watch: {
    searchText (val) {
      if (val === '') {
        this.dropdownItemsSliceIndex = 20
        populateDropdownItems(this)
        const scroll = () => { scrollUpdate(this) }
        this.scroll = this.$throttle(scroll, 10)
        this.listContainer.addEventListener('scroll', this.scroll)
      } else {
        populateDropdownItems(this)
      }
    }
  },

  mounted () {
    this.listContainer = this.$refs.listContainer
    this.$emit('setFiltersPanelListWrapperHeight', this.listWrapperHeight - 3.5 * 3)
    populateDropdownItems(this)
    const scroll = () => { scrollUpdate(this) }
    this.scroll = this.$throttle(scroll, 10)
    this.listContainer.addEventListener('scroll', this.scroll)
  },

  beforeDestroy () {
    this.listContainer.removeEventListener('scroll', this.scroll)
  },

  methods: {
    selectFilterOption (e, option, subOption) {
      e.stopPropagation()
      const parent = CloneDeep(this.compileFilterOption(option))
      if (parent.matches) {
        parent.matches = parent.matches.map((match) => {
          return this.compileFilterOption(match)
        })
      }
      const child = subOption ? this.compileFilterOption(subOption, { parent }) : false
      this.$emit('selectFilterOption', {
        parent,
        child
      })
      this.drawerOpen = false
    },
    compileFilterOption (option, append) {
      return Object.assign(option, append, {
        type: this.filter.type,
        filter: option.filterDatabaseKey || this.filterDatabaseKey,
        match: this.filter.match
      })
    },
    selectDropdownMultiple () {
      this.$emit('setDropdownMultiple', this.index)
      const timeout = setTimeout(() => {
        this.$refs['search-input'].focus()
        clearTimeout(timeout)
      }, 250)
    },
    selectDropdownInner (e, id, className) {
      e.stopPropagation()
      if (id === this.dropdownInner) {
        this.dropdownInner = false
        this.dropdownInnerHeight = false
      } else {
        const dropdown = e.target // .dropdown-inner-dropdown-button
          .parentNode // .selector
          .nextElementSibling // .dropdown-inner
          .firstElementChild // .dropdown-inner-wrapper
        this.dropdownInner = id
        this.dropdownInnerHeight = `${dropdown.clientHeight}px`
      }
    },
    selectedFilter () {
      return this.selectedDropdownMultiple === this.index
    },
    selectedDropdownInner (id) {
      return this.dropdownInner === id
    },
    selectedOption (item) {
      return this.selectedFilterOptions.hasOwnProperty(item.id)
    },
    selectedSubOptions (option) {
      const selectedFilterOptions = this.selectedFilterOptions
      const subOptions = option.matches
      if (subOptions) {
        let selected = false
        subOptions.forEach((option) => {
          if (selectedFilterOptions.hasOwnProperty(option.id)) {
            selected = true
          }
        })
        return selected
      }
      return false
    },
    translateAmount () {
      const index = this.index
      if (this.selectedDropdownMultiple === -1) {
        return 0
      } else if (index === 0) {
        return 0
      } else if (index <= this.selectedDropdownMultiple) {
        return 0
      } else {
        return this.listWrapperHeight - 3.5 * 3
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$displayHeight: 3.5rem;
$searchInputHeight: 3rem;
$listItemDimension: 3rem;

// ///////////////////////////////////////////////////////////////////// General
.dropdown {
  position: relative;
  width: 100%;
  background-color: $athensGray;
  transition: 250ms ease-in;
  &.dropdown-open {
    transform: translateY(0);
    &:not(:last-child) {
      .list-wrapper {
        border-bottom: 1px solid $borderColor;
      }
    }
  }
}

// ///////////////////////////////////////////////////////////////////// Display
.display {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 1.5rem;
  height: $displayHeight;
  cursor: pointer;
  transition: 250ms ease-out;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 100%;
    width: 1px;
    transform: scaleX(0);
    height: 100%;
    background-color: $mineShaft;
    transition: 250ms ease-out;
  }
  &:not(.dropdown-open) {
    &:hover {
      transition: 250ms ease-in;
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
  &.dropdown-open {
    transition: 250ms ease-in;
    background-color: white;
    &:before {
      transition: 250ms ease-in;
      transform: scaleX(3);
    }
    .chevron {
      &:before {
        transition: 250ms ease-in;
        transform: rotate(-180deg) translate(-0.25rem, 0.25rem);
      }
    }
  }
}

.label {
  white-space: nowrap;
  text-transform: uppercase;
  font-size: 0.875rem;
  cursor: pointer;
}

.chevron {
  width: 1rem;
  pointer-events: none;
  &:before {
    content: '';
    display: inline-block;
    border-style: solid;
    border-width: 0.125rem 0.125rem 0 0;
    width: 0.375em;
    height: 0.375rem;
    position: relative;
    top: 0.125em;
    left: 0.125rem;
    transition: 250ms ease-out;
  }
  &.up {
    transform: rotate(-45deg);
  }
  &.down {
    transform: rotate(135deg);
  }
}

// //////////////////////////////////////////////////////////////// Search Input
.search-input-container {
  position: absolute;
  top: $displayHeight;
  left: 0;
  width: 100%;
  height: $searchInputHeight;
  background-color: $athensGray;
}

.search-svg-icon {
  position: absolute;
  top: calc((#{$searchInputHeight} - 0.75rem) / 2);
  left: calc((#{$searchInputHeight} - 1rem) / 2);
  width: 0.75rem;
  opacity: 0.5;
}

.search-input {
  @include placeholder {
    font-style: italic;
    letter-spacing: 1px;
  }
  width: 100%;
  height: 100%;
  padding: 0.5rem 1.5rem;
  padding-left: calc(1.5rem + 1rem);
  font-size: 0.75rem;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    background-color: rgba(255, 255, 255, 0.6);
  }
}

// //////////////////////////////////////////////////////////////////////// List
.list-wrapper {
  position: absolute;
  top: $displayHeight + $searchInputHeight;
  left: 0;
  width: 100%;
  height: calc(35rem - #{$searchInputHeight * 2} - #{$displayHeight * 2} - 0.5rem); // not sure where the extra 0.5rem is coming from
  background-color: $athensGray;
  transition: 250ms ease-out;
}

.list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}

.list-item {
  position: relative;
  padding-right: 1.5rem;
  cursor: pointer;
  &:first-child {
    padding-top: 0.75rem;
  }
  &:last-child {
    padding-bottom: 0.75rem;
  }
}

.selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    color: $electricViolet;
    .selection-indicator {
      &:before,
      &:after {
        transition: 250ms ease-in;
        background-color: $electricViolet;
      }
    }
  }
  &.selected {
    .selection-indicator {
      &:before,
      &:after {
        transition: 250ms ease-in;
        background-color: $electricViolet;
      }
      &:before {
        transform: rotate(45deg) translate(-2px, 3px) scaleX(0.6875);
      }
      &:after {
        transform: rotate(45deg) scaleY(1.1) translate(0px, -1px);
      }
    }
  }
  &.suboption-selected:not(.selected) {
    .selection-indicator {
      &:before,
      &:after {
        transition: 250ms ease-in;
      }
      &:before {
        opacity: 0;
      }
      &:after {
        background-color: $electricViolet;
      }
    }
  }
}

.dropdown-inner-dropdown-button {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background-color: rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
  .chevron.down {
    position: relative;
    left: 7px;
    bottom: 2px;
  }
}

.dropdown-inner {
  position: relative;
  overflow: hidden;
  transition: 250ms ease-out;
  &.dropdown-inner-open {
    transition: 250ms ease-in;
  }
}

.dropdown-inner-open {
  .chevron {
    &:before {
      transition: 250ms ease-in;
      transform: rotate(-180deg) translate(-3px, 3px);
    }
  }
}

.dropdown-inner-wrapper {
  position: absolute;
  top: 0;
  left: 1.75rem;
}

.selection-indicator {
  position: relative;
  width: 3rem;
  height: 100%;
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    font-weight: 700;
    background-color: $mineShaft;
    transition: 250ms ease-out;
  }
  &:before {
    width: 0.5rem;
    height: 0.125rem;
  }
  &:after {
    height: 0.5rem;
    width: 0.125rem;
  }
}

.name {
  flex: 1;
  padding-right: 0.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.placeholder {
  @include label;
  padding: 1.5rem;
  text-align: center;
}
</style>
