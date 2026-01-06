import CloneDeep from 'lodash/cloneDeep'

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
const processQuery = (filters) => {
  return new Promise((resolve) => {
    const restrictedDatabaseKeys = ['riskFactorCategory'] // do not submit these filters
    const compiled = []
    for (const key in filters) {
      const option = filters[key]
      if (!restrictedDatabaseKeys.includes(option.filterDatabaseKey)) {
        if (option.hasOwnProperty('parent')) {
          delete option.parent
        }
        compiled.push(option)
      }
    }
    resolve(compiled)
  })
}

// /////////////////////////////////////////////////////////////////////// State
// -----------------------------------------------------------------------------
export const state = () => ({
  resultList: [],
  displayChart: false,
  displayTables: false,
  selectedResults: [],
  firstSearchPerformed: false,
  resultCount: false
})

// ///////////////////////////////////////////////////////////////////// Getters
// -----------------------------------------------------------------------------
export const getters = {
  resultList: state => state.resultList,
  displayChart: state => state.displayChart,
  displayTables: state => state.displayTables,
  selectedResults: state => state.selectedResults,
  firstSearchPerformed: state => state.firstSearchPerformed,
  resultCount: state => state.resultCount
}

// ///////////////////////////////////////////////////////////////////// Actions
// -----------------------------------------------------------------------------
export const actions = {
  // ///////////////////////////////////////////////////////////// getResultList
  async getResultList ({ commit }, payload) {
    try {
      const response = await this.$AxiosAuth.post(`${this.$config.backendUrl}/get-result-list`, {
        filters: await processQuery(CloneDeep(this.getters['query/filterOptions']))
      })
      const results = response.data.payload
      this.dispatch('result/setResultList', results)
      return results
    } catch (e) {
      console.log('====== [Store Action: result/getResultList] ERROR')
      console.log(e)
    }
  },
  // //////////////////////////////////////////////////////////// getResultCount
  async getResultCount ({ commit }) {
    try {
      const response = await this.$AxiosAuth.get(`${this.$config.backendUrl}/get-result-count`)
      const count = response.data.payload
      commit('SET_RESULT_COUNT', count)
      return count
    } catch (e) {
      console.log('====== [Store Action: admin/getSiteContent] ERROR')
      console.log(e)
    }
  },
  // ///////////////////////////////////////////////////////////// setResultList
  setResultList ({ commit }, resultList) {
    commit('SET_RESULT_LIST', resultList)
  },
  // /////////////////////////////////////////////////////////// setDisplayChart
  setDisplayChart ({ commit }, status) {
    commit('SET_DISPLAY_CHART', status)
  },
  // /////////////////////////////////////////////////////////// setDisplayTable
  setDisplayTables ({ commit }, status) {
    commit('SET_DISPLAY_TABLES', status)
  },
  // /////////////////////////////////////////////////////////// setDisplayChart
  setSelectedResults ({ commit }, results) {
    commit('SET_SELECTED_RESULTS', results)
  },
  // /////////////////////////////////////////////////////////// setDisplayChart
  setFirstSearchPerformed ({ commit }) {
    commit('SET_FIRST_SEARCH_PERFORMED')
  }
}

// /////////////////////////////////////////////////////////////////// Mutations
// -----------------------------------------------------------------------------
export const mutations = {
  SET_RESULT_LIST (state, resultList) {
    state.resultList = resultList
  },
  SET_DISPLAY_CHART (state, status) {
    state.displayChart = status
  },
  SET_DISPLAY_TABLES (state, status) {
    state.displayTables = status
  },
  SET_SELECTED_RESULTS (state, results) {
    state.selectedResults = results
  },
  SET_FIRST_SEARCH_PERFORMED (state, results) {
    state.firstSearchPerformed = true
  },
  SET_RESULT_COUNT (state, count) {
    state.resultCount = count
  }
}
