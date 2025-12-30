// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
import CloneDeep from 'lodash/cloneDeep'

import Config from '@/nuxt.config'

const url = Config.void.core.backendUrl

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
const updateSingleFilterOption = (filterOptions, option, replace) => {
  const id = option.id
  if (replace) {
    filterOptions[id] = option
    return
  }
  filterOptions.hasOwnProperty(id) ? delete filterOptions[id] : filterOptions[id] = option
}

const checkParentChildState = (filterOptions, parent, child) => {
  const matches = parent.matches
  const matchCount = matches.length
  let num = 0
  matches.forEach((match) => {
    if (filterOptions.hasOwnProperty(match.id)) {
      num++
    }
  })
  return num === matchCount
}

const updateMultiFilterOptions = (filterOptions, parent, child) => {
  const parentId = parent.id
  const matches = parent.matches
  if (parent && !child) {
    matches.forEach((match) => {
      const matchId = match.id
      filterOptions.hasOwnProperty(parentId) ? filterOptions[matchId] = Object.assign(match, { parent }) : delete filterOptions[matchId]
    })
  } else {
    const select = checkParentChildState(filterOptions, parent, child)
    select ? filterOptions[parentId] = parent : delete filterOptions[parentId]
  }
}

// /////////////////////////////////////////////////////////////////////// State
// -----------------------------------------------------------------------------
export const state = () => ({
  filters: {},
  filterOptions: {}
})

// ///////////////////////////////////////////////////////////////////// Getters
// -----------------------------------------------------------------------------
export const getters = {
  filters: state => state.filters,
  filterOptions: state => state.filterOptions
}

// ///////////////////////////////////////////////////////////////////// Actions
// -----------------------------------------------------------------------------
export const actions = {
  // //////////////////////////////////////////////////////////////// getFilters
  async getFilters ({ commit }, tag) {
    try {
      const response = await this.$AxiosAuth.get(`${url}/get-filters/?filter=${tag}`)
      this.dispatch('query/setFilters', {
        tag,
        filters: response.data.payload
      })
    } catch (e) {
      console.log('====== [Store Action: query/getFilters] ERROR')
      throw e
    }
  },
  // //////////////////////////////////////////////////////////////// setFilters
  setFilters ({ commit, getters }, payload) {
    const filters = CloneDeep(getters.filters)
    filters[payload.tag] = payload.filters
    commit('SET_FILTERS', filters)
  },
  // /////////////////////////////////////////////////////////// addFilterOption
  addFilterOption ({ commit, getters }, payload) {
    const filterOptions = CloneDeep(getters.filterOptions)
    const parent = payload.parent
    const child = payload.child
    const replace = payload.replace // range-slider should replace instead of toggle

    /*
      - If parent and no child (dropdown singular, checkboxes, range slider)
        - Toggle
      - If parent that contains children but not a child itself (dropdown nested, top-level)
        - Toggle parent
          - If parent ON -> all children ON
          - If parent OFF -> all children OFF
      - If parent & child (dropdown nested, nested item)
        - If last unselected child selected, select it AND the parent
        - If last selected child selected, deselect it AND the parent
        - Anything in between
          - If parent selected, deselect it
          - Toggle child
    */

    // Need to check parent.matches[0] because checkboxes = array of strings and riskFactor = array of objects
    if (parent && Array.isArray(parent.matches) && typeof parent.matches[0] === 'object' && !child) { // toggle parent w/ all children on/off (ex: top-level dropdown Option with SubOptions)
      updateSingleFilterOption(filterOptions, parent)
      updateMultiFilterOptions(filterOptions, parent)
    } else if (parent && child) { // a single child nested under a parent is selected (ex: SubOption nested under a top-level dropdown Option)
      updateSingleFilterOption(filterOptions, child)
      updateMultiFilterOptions(filterOptions, parent, child)
    } else { // toggle child/singular -> everything else toggled here
      updateSingleFilterOption(filterOptions, parent, replace)
    }
    commit('ADD_FILTER_OPTION', filterOptions)
  },
  // //////////////////////////////////////////////////////// removeFilterOption
  removeFilterOption ({ commit, getters }, id) {
    const filterOptions = CloneDeep(getters.filterOptions)
    delete filterOptions[id]
    commit('ADD_FILTER_OPTION', filterOptions)
  },
  // //////////////////////////////////////////////////////// clearFilterOptions
  clearFilterOptions ({ commit }) {
    commit('CLEAR_FILTER_OPTIONS')
  }
}

// /////////////////////////////////////////////////////////////////// Mutations
// -----------------------------------------------------------------------------
export const mutations = {
  SET_FILTERS (state, filters) {
    state.filters = filters
  },
  CLEAR_FILTER_OPTIONS (state) {
    state.filterOptions = {}
  },
  ADD_FILTER_OPTION (state, filterOptions) {
    state.filterOptions = filterOptions
  }
}
