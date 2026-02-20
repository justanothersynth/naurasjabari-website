<template>
  <div class="year-single-selector">

    <div
      v-for="(option, key) in options"
      :key="key"
      :class="['option', { selected: isSelected(option) }]"
      @click="selectOption(option)">

      <div class="name">
        {{ option.name }}
      </div>

    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters, mapActions } from 'vuex'
import CloneDeep from 'lodash/cloneDeep'

// ====================================================================== Export
export default {
  name: 'YearSingleSelector',

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

  data () {
    return {
      id: 'year-single-selector',
      options: []
    }
  },

  computed: {
    ...mapGetters({
      selectedFilterOptions: 'query/filterOptions'
    })
  },

  created () {
    const options = CloneDeep(this.filter.options)
    this.options = options.sort((a, b) => parseInt(b.name) - parseInt(a.name))
  },

  methods: {
    ...mapActions({
      removeFilterOption: 'query/removeFilterOption'
    }),
    selectOption (option) {
      this.removeFilterOption('year-range-slider')
      const year = parseInt(option.name)
      this.$emit('selectFilterOption', {
        parent: {
          id: this.id,
          type: this.filter.type,
          filter: this.filterDatabaseKey,
          match: this.filter.match,
          min: year,
          max: year
        },
        child: false,
        replace: true
      })
    },
    isSelected (year) {
      const option = this.selectedFilterOptions[this.id]
      if (!option) { return false }
      return `${option.min}` === year.name
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.year-single-selector {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  &:hover {
    .option {
      transition: 250ms ease-in;
      opacity: 0.5;
      &:hover {
        transition: 250ms ease-in;
        opacity: 1;
      }
    }
  }
}

// ///////////////////////////////////////////////////////////////////// Options
.option {
  display: flex;
  flex-direction: row;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid $mineShaft;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: 250ms ease-out;
  &.selected {
    transition: 250ms ease-in;
    background-color: $mineShaft;
    color: white;
  }
}

.name {
  flex: 1;
  font-size: 0.75rem;
  line-height: 1;
}
</style>
