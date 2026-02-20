// ///////////////////////////////////////////////////////// Imports & Variables
// -----------------------------------------------------------------------------
import { Agent } from 'https'
import Axios from 'axios'

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
// //////////////////////////////////////////////////// CreateAxiosAuthTransport
const CreateAxiosAuthTransport = (baseURL) => {
  return Axios.create({
    withCredentials: true,
    baseURL,
    httpsAgent: new Agent({
      rejectUnauthorized: false
    })
  })
}

// ////////////////////////////////////////////////////////////////////// Export
// -----------------------------------------------------------------------------
export default ({ $config, app, store, req, router }, inject) => {
  Axios.defaults.withCredentials = true
  inject('AxiosAuth', CreateAxiosAuthTransport($config.backendUrl))
}
