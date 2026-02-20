// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/routes/index'
import Admin from '@/routes/admin'

// /////////////////////////////////////////////////////////////////////// Setup
// -----------------------------------------------------------------------------
Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Home
      },
      {
        path: '/admin',
        component: Admin,
        meta: {
          requiresAuth: true
        }
      }
    ]
  })
}
