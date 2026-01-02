export default {
  ssr: false,
  // //////////////////////////////////////////////////////////////////// Server
  // ---------------------------------------------------------------------------
  server: {
    port: 3457
  },
  // ///////////////////////////////////////////////////// Runtime Configuration
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------- [Runtime] Public
  publicRuntimeConfig: {
    backendUrl: (function () {
      // Allow environment variable to override (for Docker)
      if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL
      }
      const env = process.env.SERVER_ENV
      let uri
      switch (env) {
        case 'development': uri = 'https://localhost:3458'; break
        case 'staging': uri = 'https://surf-dataquery.com/api'; break
        case 'production': uri = 'https://surf-dataquery.com/api'; break
        default : uri = 'https://localhost:3458'; break
      } return uri
    }()),
    csvUploadPath: (function () {
      // Allow environment variable to override (for Docker)
      const backendUrl = process.env.BACKEND_URL
      if (backendUrl) {
        return backendUrl + '/result-csv-upload'
      }
      const env = process.env.NODE_ENV
      let uri
      switch (env) {
        case 'development': uri = 'https://localhost:3458/result-csv-upload'; break
        case 'staging': uri = 'https://surf-dataquery.com/api/result-csv-upload'; break
        case 'production': uri = 'https://surf-dataquery.com/api/result-csv-upload'; break
        default : uri = 'https://localhost:3458/result-csv-upload'; break
      } return uri
    }())
  },
  // --------------------------------------------------------- [Runtime] Private
  privateRuntimeConfig: {},
  // /////////////////////////////////////////////////////// Headers of the Page
  // ---------------------------------------------------------------------------
  head: {
    title: 'Douglas',
    description: '#1 source for suicide data.',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '#1 source for suicide data.' || process.env.npm_package_description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }
    ]
  },
  // ////////////////////////////////////////// Customize the progress-bar color
  // ---------------------------------------------------------------------------
  loading: {
    color: '#FFFFFF',
    height: '4px'
  },
  // /////////////////////////////////////////////////////////// Global CSS/SCSS
  // ---------------------------------------------------------------------------
  css: [
    '~/assets/scss/normalize.scss',
    '~/assets/scss/gridlex-2.7.1/gridlex.scss',
    '~/assets/scss/main.scss'
  ],
  styleResources: {
    scss: [
      '~/assets/scss/variables.scss'
    ]
  },
  // /////////////////////////////////// Plugins to load before mounting the App
  // ---------------------------------------------------------------------------
  plugins: [
    { src: '~/plugins/global-methods' },
    { src: '~/plugins/axios-auth' },
    { src: '~/plugins/scroll-to' },
    { src: '~/vendor/nouislider-14.1.1', mode: 'client' }
  ],
  // /////////////////////////////////////////////////////// Nuxt.js Dev Modules
  // ---------------------------------------------------------------------------
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module'
  ],
  // /////////////////////////////////////////////////////////// Nuxt.js Modules
  // ---------------------------------------------------------------------------
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    '@agency-undone/au-nuxt-module-zero'
  ],
  // /////////////////////////////////////////////////////// Router + Middleware
  // ---------------------------------------------------------------------------
  router: {
    middleware: ['auth']
  },
  // //////////////////////////////////////////////// Axios module configuration
  // -------------------------------------- See https://axios.nuxtjs.org/options
  axios: {
    debug: true
  },
  // ///////////////////////////////////////////////////////////// [Module] Zero
  // ---------------------------------------------------------------------------
  zero: {
    core: {
      include: true
    },
    filters: {
      include: false
    },
    pagination: {
      include: false
    }
  },
  toaster: {
    display: 10,
    timeout: 5000
  },
  // //////////////////////////////////////////////////////// Void Configuration
  // --------- See https://markus.oberlehner.net/blog/combining-graphql-and-vuex
  void: {
    core: {
      backendUrl: (function () {
        // Allow environment variable to override (for Docker)
        if (process.env.BACKEND_URL) {
          return process.env.BACKEND_URL
        }
        const env = process.env.NODE_ENV
        let uri
        switch (env) {
          case 'development': uri = 'https://localhost:3458'; break
          case 'staging': uri = 'https://surf-dataquery.com/api'; break
          case 'production': uri = 'https://surf-dataquery.com/api'; break
          default : uri = 'https://localhost:3458'; break
        } return uri
      }())
    },
    // apollo: {
    //   uri: (function () {
    //     const env = process.env.NODE_ENV
    //     let uri
    //     switch (env) {
    //       case 'development': uri = 'https://localhost:3458/graphql'; break
    //       case 'staging': uri = 'https://surf-dataquery.com/api/graphql'; break
    //       case 'production': uri = 'https://surf-dataquery.com/api/graphql'; break
    //       default : uri = 'https://localhost:3458/graphql'; break
    //     } return uri
    //   }())
    // },
    // auth: {
    //   loginPath: '/login',
    //   redirectAfterLogin: '/admin/result/upload-csv',
    //   redirectAfterLogout: '/login'
    // },
    // admin: { // update @/modules/AdminCore/Middleware/index.js when adding keys
    //   lockAdmin: true,
    //   routes: [
    //     // {
    //     //   path: '/admin/users',
    //     //   label: 'Users',
    //     //   model: 'user'
    //     // },
    //     {
    //       path: '/admin/result/upload-csv',
    //       label: 'Results',
    //       model: 'result'
    //     },
    //     {
    //       path: '/admin/collections',
    //       label: 'Collections',
    //       model: 'collection'
    //     }
    //   ],
    //   core: {
    //     defaultLimit: 50
    //   },
    //   user: {
    //     redirectAfterDelete: '/admin/users'
    //   },
    //   role: {
    //     redirectAfterDelete: '/admin/roles'
    //   },
    //   result: {
    //     defaultLimit: 50,
    //     redirectAfterDelete: '/admin/results',
    //     csvUploadPath: (function () {
    //       const env = process.env.NODE_ENV
    //       let uri
    //       switch (env) {
    //         case 'development': uri = 'https://localhost:3458/result/csv-upload'; break
    //         case 'staging': uri = 'https://surf-dataquery.com/api/result/csv-upload'; break
    //         case 'production': uri = 'https://surf-dataquery.com/api/result/csv-upload'; break
    //         default : uri = 'https://localhost:3458/result/csv-upload'; break
    //       } return uri
    //     }())
    //   },
    //   collection: {
    //     redirectAfterDelete: '/admin/collections'
    //   },
    //   media: {
    //     defaultLimit: 24,
    //     mediaUploadPath: (function () {
    //       const env = process.env.NODE_ENV
    //       let uri
    //       switch (env) {
    //         case 'development': uri = 'https://localhost:3458/media/upload'; break
    //         case 'staging': uri = 'https://surf-dataquery.com/api/media/upload'; break
    //         case 'production': uri = 'https://surf-dataquery.com/api/media/upload'; break
    //         default : uri = 'https://localhost:3458/media/upload'; break
    //       } return uri
    //     }())
    //   }
    // },
    toaster: {
      display: 10,
      timeout: false
    }
  },
  // /////////////////////////////////////////////////////// Build configuration
  // ------------------------------------------------ Extend webpack config here
  build: {
    // ---------------------------------------------------------- Hot Middleware
    hotMiddleware: {
      client: {
        overlay: false
      }
    },
    // -------------------------------------------------------------- Extensions
    extend (config, ctx) {
      config.module.rules.push({
        test: /\.md$/,
        use: 'raw-loader'
      })
    }
  }
}
