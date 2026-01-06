module.exports = {
  port: 3458,
  appRoot: __dirname,
  publicPath: __dirname + '/public',
  publicDirectories: [
    'csv',
    'image',
    'image/original',
    'image/thumb64',
    'image/thumb128',
    'image/thumb256',
    'image/thumb512',
    'image/thumb1024',
    'image/thumb2048'
  ],
  allowedFileTypes: [
    { ext: 'csv', type: 'document' },
    { ext: 'png', type: 'image' },
    { ext: 'jpg', type: 'image' },
    { ext: 'jpeg', type: 'image' },
    { ext: 'gif', type: 'image' }
  ],
  dataPath: __dirname + '/data',
  frontendUrl: (function () {
    const env = process.env.SERVER_ENV
    let uri = 'https://localhost:3457' // development
    switch (env) {
      case 'stable': uri = 'https://works.naurasjabari.com/surf-dqt'; break
      case 'production': uri = 'https://works.naurasjabari.com/surf-dqt'; break
    } return uri
  }()),
  backendUrl: (function () {
    const env = process.env.SERVER_ENV
    let uri = 'https://localhost:3458' // development
    switch (env) {
      case 'stable': uri = 'https://works.naurasjabari.com/surf-dqt/api'; break
      case 'production': uri = 'https://works.naurasjabari.com/surf-dqt/api'; break
    } return uri
  }()),
  Jwt: false,
  JwtOptions: false,
  Passport: false,

  Server: false,
  Database: process.env.DATABASE_URL,
  MongoConnectionOptions: {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    autoIndex: false,
    user: process.env.DATABASE_USER,
    pass: process.env.DATABASE_PASSWORD,
    authSource: 'admin'
  },

  // Database: (function () {
  //   var env = process.env.SERVER_ENV
  //   var db = ''
  //   switch (env) {
  //     case 'development': db = process.env.DOUGLAS_DB || 'mongodb://localhost/Douglas_Development'; break
  //     case 'staging': db = process.env.DOUGLAS_DB || 'mongodb://localhost/Douglas_Staging'; break
  //     case 'production': db = process.env.DOUGLAS_DB || 'mongodb://localhost/Douglas_Production'; break
  //   } return db
  // }()),
  // MongoConnectionOptions: {},
  MongooseConnection: false,
  Model: {},
  ApolloServer: false,
  CorsOptions: {
    origin: [
      'http://localhost:3457',
      'https://localhost:3457',
      'http://frontend:3457',
      'https://works.naurasjabari.com'
    ],
    methods: 'OPTIONS,GET,POST',
    allowedHeaders: 'Origin,Accept,Authorization,X-Requested-With,Content-Type,Cache-Control',
    credentials: true,
    optionsSuccessStatus: 200
  },
  Multer: false,
  MulterOptions: {},
  ExpressSessionOptions: {
    secret: process.env.EXPRESS_SESSION_SECRET,
    name: process.env.EXPRESS_SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    store: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Expires in 24hrs
      httpOnly: true,
      sameSite: 'lax',
      secure: (function () {
        const env = process.env.SERVER_ENV
        if (env !== 'development') { return true }
        return false
      }())
    }
  },
  Ac: false, // AccessControl (npm: accesscontrol)
  RoleActions: {
    result: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'firstAuthor', 'year', 'country', 'outcome', 'population', 'riskFactor', 'comparator', 'estimator', 'sizeEffect', 'confidenceInterval', 'pValue', 'design', 'status']
    },
    user: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'name', 'description', 'permissions']
    },
    role: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'name', 'email', 'password', 'role']
    },
    collection: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'name', 'slug', 'blocks', 'author']
    },
    block: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'name', 'type', 'blocks', 'author', 'status']
    },
    media: {
      actions: {
        create: ['any', 'none'],
        read: ['any', 'none'],
        update: ['any', 'none'],
        delete: ['any', 'none']
      },
      attributes: ['*', 'url', 'filename', 'sizes', 'title', 'caption', 'alttext', 'description', 'origfilename', 'mimetype', 'extension', 'filetype', 'filesize', 'encoding', 'dropzoneMetadata', 'author']
    }
  }
}
