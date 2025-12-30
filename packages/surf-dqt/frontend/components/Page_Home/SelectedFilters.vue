<template>
  <div class="selected-filters">

    <div
      v-for="(option, key) in options"
      :key="key"
      :class="['option', { parent: option.hasOwnProperty('category') }]"
      @click="removeFilter(option)">

      <div class="remove-filter-button">
        <IconCloseThick :fill="option.hasOwnProperty('category') ? 'white' : '#8772CB'" />
      </div>

      <!-- population, country, firstAuthor, checkbox, riskFactor -->
      <div
        v-if="option.name || option.matches"
        class="name">
        {{ option.name || option.category }}
      </div>

      <!-- year, sizeEffect -->
      <div
        v-else
        class="range">
        <template v-if="option.min === option.max">
          {{ parseInt(option.min) }}
        </template>
        <template v-else>
          {{ parseInt(option.min) }} - {{ parseInt(option.max) }}
        </template>
      </div>

    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import IconCloseThick from '@/components/Icons/CloseThick'

// ====================================================================== Export
export default {
  name: 'SelectedFilters',

  components: {
    IconCloseThick
  },

  props: {
    options: {
      type: Object,
      required: true
    }
  },

  methods: {
    removeFilter (option) {
      const parent = option.parent || option
      this.$emit('selectFilterOption', {
        parent,
        child: option.parent ? option : false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.selected-filters {
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
  align-items: center;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid $coldPurple;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: 250ms ease-out;
  &.parent {
    background-color: $blueMarguerite;
    .name,
    .range {
      color: white;
    }
  }
}

.remove-filter-button {
  width: 0.5rem;
}

.name,
.range {
  flex: 1;
  padding-left: 0.75rem;
  font-size: 0.75rem;
  color: $blueMarguerite;
}

.name {
  line-height: 1;
}
</style>
