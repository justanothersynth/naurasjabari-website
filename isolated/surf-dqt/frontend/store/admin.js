// /////////////////////////////////////////////////////////////////////// State
// -----------------------------------------------------------------------------
export const state = () => ({
  siteContent: [],
  loading: false,
  authMessage: false
})

// ///////////////////////////////////////////////////////////////////// Getters
// -----------------------------------------------------------------------------
export const getters = {
  siteContent: state => state.siteContent,
  loading: state => state.loading,
  authMessage: state => state.authMessage
}

// ///////////////////////////////////////////////////////////////////// Actions
// -----------------------------------------------------------------------------
export const actions = {
  // //////////////////////////////////////////////////////////// getSiteContent
  async getSiteContent ({ commit }, flatten = false) {
    try {
      const response = await this.$AxiosAuth.get(`${this.$config.backendUrl}/get-site-content?flatten=${flatten}`)
      const content = response.data.payload
      this.dispatch('admin/setSiteContent', content)
      return content
    } catch (e) {
      console.log('====== [Store Action: admin/getSiteContent] ERROR')
      console.log(e)
    }
  },
  // //////////////////////////////////////////////////////////// setSiteContent
  setSiteContent ({ commit }, siteContent) {
    commit('SET_SITE_CONTENT', siteContent)
  },
  // /////////////////////////////////////////////////////////// postSiteContent
  async postSiteContent ({ commit, dispatch }, payload) {
    try {
      dispatch('setLoading', true)
      const response = await this.$AxiosAuth.post(`${this.$config.backendUrl}/post-site-content`, payload)
      dispatch('setLoading', false)
      this.$Toaster.addToast({
        type: 'toast',
        category: 'success',
        message: 'Content has been updated successfully'
      })
      return response.data.payload
    } catch (e) {
      console.log('====== [Store Action: admin/postSiteContent] ERROR')
      console.log(e)
      dispatch('setLoading', false)
    }
  },
  // ///////////////////////////////////////////////////////////////// postImage
  async postImage ({ commit }, payload) {
    try {
      const formData = new FormData()
      formData.append('media', payload.image)
      formData.append('section_id', payload.sectionId)
      formData.append('namespace', payload.namespace)
      const response = await this.$AxiosAuth.post(`${this.$config.backendUrl}/post-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.payload
    } catch (e) {
      console.log('====== [Store Action: admin/postImage] ERROR')
      console.log(e)
    }
  },
  // //////////////////////////////////////////////////////////////// processCsv
  async processCsv ({ commit }) {
    try {
      return await this.$AxiosAuth.get(`${this.$config.backendUrl}/results-process-csv`)
    } catch (e) {
      console.log('====== [Store Action: admin/processCsv] ERROR')
      console.log(e.response)
      return false
    }
  },
  // //////////////////////////////////////////////////////// processGroupingCsv
  async processGroupingCsv ({ commit }, grouping) {
    try {
      return await this.$AxiosAuth.get(`${this.$config.backendUrl}/grouping-process-csv?grouping=${grouping}`)
    } catch (e) {
      console.log('============ [Store Action: admin/processGroupingCsv] ERROR')
      console.log(e.response)
      return false
    }
  },
  // ///////////////////////////////////////////////////////////////////// login
  async login ({ commit, dispatch }, payload) {
    dispatch('setAuthMessage', false)
    try {
      dispatch('setLoading', true)
      const response = await this.$AxiosAuth.post(`${this.$config.backendUrl}/login`, payload)
      const data = response.data
      const token = data.payload
      const message = data.message
      if (!token) {
        dispatch('setLoading', false)
        return dispatch('setAuthMessage', message)
      }
      localStorage.setItem('surfdqt__token', token)
      this.$router.push('/modify')
      this.$Toaster.addToast({
        type: 'toast',
        category: 'success',
        message
      })
      dispatch('setLoading', false)
    } catch (e) {
      dispatch('setLoading', false)
      dispatch('setAuthMessage', e.message)
    }
  },
  // ////////////////////////////////////////////////////////////// authenticate
  async authenticate ({ commit }) {
    const token = localStorage.getItem('surfdqt__token')
    try {
      await this.$AxiosAuth.get(`${this.$config.backendUrl}/authenticate`, { headers: { Authorization: token } })
      return true
    } catch (e) {
      return false
    }
  },
  // //////////////////////////////////////////////////////////// setAuthMessage
  setAuthMessage ({ commit }, message) {
    commit('SET_AUTH_MESSAGE', message)
  },
  // //////////////////////////////////////////////////////////////// setLoading
  setLoading ({ commit }, status) {
    commit('SET_LOADING', status)
  }
}

// /////////////////////////////////////////////////////////////////// Mutations
// -----------------------------------------------------------------------------
export const mutations = {
  SET_SITE_CONTENT (state, siteContent) {
    state.siteContent = siteContent
  },
  SET_AUTH_MESSAGE (state, message) {
    state.authMessage = message
  },
  SET_LOADING (state, status) {
    state.loading = status
  }
}
