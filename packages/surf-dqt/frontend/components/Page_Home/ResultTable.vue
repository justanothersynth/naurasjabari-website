<template>
  <div class="result-table">

    <div
      v-if="tables && displayChart && displayTables"
      class="container">

      <template v-for="(table, tableIndex) in tables">
        <div
          v-if="table.results"
          :key="tableIndex"
          class="table-wrapper">

          <div class="table-heading">
            Table {{ tableIndex + 1 }}
          </div>

          <div class="table-subheading">
            {{ table.description }}
          </div>

          <div class="table-container">

            <div class="row header-row">
              <div
                v-for="(header, key) in headers"
                :key="key"
                :class="['cell', key]">
                {{ header }}
              </div>
            </div>

            <div
              v-for="(result, resultIndex) in table.results"
              :key="resultIndex"
              class="row">
              <div
                v-for="(item, key) in result"
                :key="resultIndex + key"
                :class="['cell', key]">
                <template v-if="key === 'sizeEffect'">
                  <div class="forest-plot">
                    <div class="dot" :style="{ left: getForestPlotPosition(item, table.sizeEffectData) + '%' }">
                      <span class="value">{{ item }}</span>
                    </div>
                  </div>
                </template>
                <template v-else-if="typeof item === 'string'">
                  <div class="cell-content">
                    {{ item }}
                  </div>
                </template>
                <template v-else>
                  <div class="cell-content">
                    <div class="other-panel-top">
                      <div class="first-author">
                        {{ item.firstAuthor }}
                      </div>
                      <div class="year">
                        {{ item.year }}
                      </div>
                      <div class="country">
                        {{ item.country }}
                      </div>
                    </div>
                    <div v-if="paperExists(item)" class="other-panel-bottom">
                      <div class="paper-title">
                        “{{ $limitChars(item.paperTitle, 80) }}”
                      </div>
                      <a :href="item.paperWebLink" class="paper-link" target="_blank">
                        view study
                      </a>
                    </div>
                  </div>
                </template>
              </div>
            </div>

          </div>

        </div>
      </template>

    </div>

    <div v-else class="placeholder">
      No results found
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'
import CloneDeep from 'lodash/cloneDeep'

// ====================================================================== Export
export default {
  name: 'ResultTable',

  data () {
    return {
      headers: {
        outcome: 'Outcome',
        population: 'Population',
        riskFactor: 'Risk Factor',
        comparator: 'Comparator',
        estimator: 'Est.',
        sizeEffect: 'Size Effect',
        other: 'First Author, Year, Country'
      }
    }
  },

  computed: {
    ...mapGetters({
      filters: 'query/filters',
      resultList: 'result/resultList',
      displayChart: 'result/displayChart',
      displayTables: 'result/displayTables',
      selectedResults: 'result/selectedResults'
    }),
    tables () {
      const selectedResults = this.selectedResults
      const filters = this.filters
      const len = selectedResults.length
      const sorted = CloneDeep(filters.estimator.groups)
      const final = []
      let index = 0
      let results = false
      function match (result) {
        if (!results) { sorted[index].results = [] }
        const sizeEffect = parseFloat(result.sizeEffect)
        if (!sorted[index].hasOwnProperty('sizeEffectData')) {
          sorted[index].sizeEffectData = { min: sizeEffect, max: sizeEffect }
        }
        if (sizeEffect < sorted[index].sizeEffectData.min) {
          sorted[index].sizeEffectData.min = sizeEffect
        } else if (sizeEffect > sorted[index].sizeEffectData.max) {
          sorted[index].sizeEffectData.max = sizeEffect
        }
        sorted[index].results.push({
          outcome: result.outcome,
          population: result.populationOriginal,
          riskFactor: result.riskFactorSecondary,
          comparator: result.comparator,
          estimator: result.estimator,
          sizeEffect,
          other: {
            firstAuthor: result.firstAuthor,
            year: result.year,
            country: result.country,
            paperTitle: result.paperTitle,
            paperWebLink: result.paperWebLink
          }
        })
      }
      if (len > 0) {
        const definitions = filters.estimator.definitions
        for (let i = 0; i < len; i++) {
          const result = selectedResults[i]
          Object.keys(definitions).map((key) => {
            const estimator = definitions[key]
            if (estimator.matches.includes(result.estimator.toLowerCase())) {
              index = sorted.findIndex(obj => obj.definitions.includes(key))
              results = sorted[index].results
              if (index !== -1) {
                return match(result)
              } else {
                index = sorted.findIndex(obj => obj.definitions.includes('ungrouped'))
                return match(result)
              }
            }
            return false
          })
        }
        const sortedLen = sorted.length
        for (let j = 0; j < sortedLen; j++) {
          const item = sorted[j]
          if (item.results) { final.push(item) }
        }
        return final
      }
      return false
    }
  },

  methods: {
    getForestPlotPosition (num, range) {
      const min = range.min
      const max = range.max
      return Math.floor(((num - min) * 100) / (max - min))
    },
    paperExists (item) {
      if (item.paperTitle && item.paperTitle !== '' && item.paperWebLink && item.paperWebLink !== '') {
        return true
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
$padding: 2rem;

// ///////////////////////////////////////////////////////////////////// General
.result-table {
  @include small {
    display: none;
  }
}

.table-heading,
.table-subheading {
  padding-left: $padding;
}

.table-heading {
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.table-subheading {
  padding-top: 0;
}

// /////////////////////////////////////////////////////////////////////// Table
.table-wrapper {
  overflow-x: scroll;
  padding-top: $padding;
  &:not(:last-child) {
    border-bottom: 1px solid $borderColor;
  }
}

.table-container {
  display: table;
  margin-top: math.div($padding, 2);
  padding: 0 calc((100vw - #{$containerWidth}) / 2) 0 $padding;
}

.row {
  display: table-row;
  &:before,
  &:after {
    content: '';
  }
  &:not(.header-row) {
    position: relative;
    transform: scale(1);
    transition: 250ms ease-out;
    &:hover {
      transition: 250ms ease-in;
      background-color: white;
      &:before,
      &:after {
        transition: 250ms ease-in;
      }
      &:before {
        opacity: 1;
      }
      &:after {
        transition-delay: 100ms;
        transform: scaleX(6);
      }
    }
    &:before {
      position: absolute;
      top: 0;
      left: -$padding;
      width: calc(100% + #{-$padding});
      height: 100%;
      background-color: white;
      z-index: 5;
      opacity: 0;
      transition: 250ms ease-out;
    }
    &:after {
      position: absolute;
      top: 0;
      left: -$padding;
      width: 1px;
      height: 100%;
      background-color: $mineShaft;
      transform: scaleX(0);
      z-index: 10;
      transition: 250ms ease-out;
    }
  }
  &.header-row {
    display: table-header-group;
    opacity: 0.5;
    .cell {
      text-transform: uppercase;
      font-size: 0.875rem;
      white-space: nowrap;
      color: #242424;
    }
  }
}

_::-webkit-full-page-media, _:future, :root .row:before,
_::-webkit-full-page-media, _:future, :root .row:after {
  display: none;
}

_::-webkit-full-page-media, _:future, :root .row:hover {
  background-color: transparent;
}

_::-webkit-full-page-media, _:future, :root .row:hover .cell-content {
  text-decoration: underline;
}

.cell {
  display: table-cell;
  position: relative;
  padding-right: 3rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  z-index: 10;
  &.outcome,
  &.estimator,
  &.other {
    .cell-content {
      font-weight: 900;
    }
  }
  &.outcome {
    .cell-content {
      min-width: 5rem;
    }
  }
  &.population {
    .cell-content {
      min-width: 10rem;
    }
  }
  &.riskFactor {
    .cell-content {
      min-width: 15rem;
    }
  }
  &.other {
    .other-panel-top,
    .first-author,
    .year,
    .country {
      font-size: inherit;
      font-weight: inherit;
      white-space: nowrap;
    }
    .other-panel-top {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      div {
        font-weight: inherit;
        padding: 0 $padding;
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
        }
      }
    }
    .other-panel-bottom {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-top: 1rem;
    }
    .paper-link,
    .paper-title {
      font-size: 0.875rem;
    }
    .paper-link {
      display: inline-block;
      padding: 0.25rem 0;
      margin-top: 1rem;
      color: $blueMarguerite;
      &:hover {
        &:before,
        &:after {
          transform: translateX(-10%);
          width: 110%;
        }
        &:before {
          bottom: 100%;
          opacity: 1;
        }
      }
      &:before,
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 5%;
        width: 90%;
        height: 1px;
        background-color: $blueMarguerite;
        transition: 250ms ease-in-out;
      }
      &:before {
        opacity: 0;
      }
    }
  }
}

.cell-content {
  font-size: 0.875rem;
  line-height: 1.4;
  letter-spacing: 0px;
}

// ///////////////////////////////////////////////////////////////// Forest Plot
$dotDimension: 0.625rem;

.forest-plot {
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: calc(50% - 1px);
    left: 0;
    width: 100%;
    height: 2px;
    background-color: $mineShaft;
  }
  .dot {
    position: absolute;
    top: calc(50% - #{math.div($dotDimension, 2)});
    width: $dotDimension;
    height: $dotDimension;
    background-color: $mineShaft;
  }
  .value {
    position: absolute;
    top: calc(100% + 0.75rem);
    left: 50%;
    transform: translateX(-50%);
    font-weight: 700;
    font-size: 0.75rem;
    line-height: 1;
  }
}

// ///////////////////////////////////////////////////////////////// Placeholder
.placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-bottom: 1px solid $borderColor;
  padding: $padding;
  padding-right: calc((100vw - #{$containerWidth}) / 2 + 1rem);
  font-weight: 700;
  height: 20rem;
}
</style>
