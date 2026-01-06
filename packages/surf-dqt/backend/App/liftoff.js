console.log(`🚀 [App] Liftoff`)

// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
//////////////////////////////////////////////////////////////////////// General
const Cors = require('cors')
const BodyParser = require('body-parser')
const ExpressSession = require('express-session')
const MongoStore = require('connect-mongo')
const Multer = require('multer')
const Mime = require('mime')
const Passport = require('passport')
const PassportJwt = require('passport-jwt')
const PassportStrategy = PassportJwt.Strategy
const PassportExtractJwt = PassportJwt.ExtractJwt
const MC = require('@Root/config')

const ProcessError = require('@Utilities/process-error')

///////////////////////////////////////////////////////////////////////// Models
MC.Model.Result = require('@Models/result')
MC.Model.User = require('@Models/user')

// /////////////////////////////////////////////////// Add CORS response headers
// -----------------------------------------------------------------------------
MC.App.use(Cors(MC.CorsOptions))

// /////////////////////////////////////////////////////// Initialize BodyParser
// -----------------------------------------------------------------------------
MC.App.use(BodyParser.urlencoded({ extended: true, limit: '25mb' }))
MC.App.use(BodyParser.json({ limit: '25mb' }))

// ///////////////////////////////////////////////////////// Initialize Sessions
// -----------------------------------------------------------------------------
MC.ExpressSessionOptions.store = MongoStore.create({
  client: MC.MongooseConnection
})
MC.App.use(ExpressSession(MC.ExpressSessionOptions))

// /////////////////////////////////////////////////////// Initialize PassportJS
// -----------------------------------------------------------------------------
MC.App.JwtOptions = {
  jwtFromRequest: PassportExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.PASSPORT_SECRET
}

Passport.use(new PassportStrategy(MC.App.JwtOptions, async (payload, next) => {
  const user = await MC.Model.User.findById(payload.id)
  if (user) { return next(null, user) }
  next(null, false)
}))

Passport.serializeUser((user, next) => {
  next(null, user._id)
})

Passport.deserializeUser((user, next) => {
  MC.Model.User.findById(user._id, (err, user) => {
    if (err) { return next(err) }
    next(null, user)
  })
})

MC.App.use(Passport.initialize())
MC.App.use(Passport.session())

MC.Passport = Passport

// /////////////////////////////////////////////////////////// Initialize Multer
// -----------------------------------------------------------------------------
MC.MulterOptions.storage = Multer.diskStorage({
  destination: function (req, file, next) {
    const allowedFileTypes = MC.allowedFileTypes
    const ext = Mime.getExtension(file.mimetype)
    const allowed = allowedFileTypes.find(obj => obj.ext === ext)
    if (allowed) {
      const path = ext === 'csv' ? `${MC.publicPath}/csv` : `${MC.publicPath}/image/original`
      next(null, path)
    } else {
      ProcessError(res, 404, `The [${ext.toUpperCase()}] filetype is not allowed`)
    }
  },
  filename: function (req, file, next) {
    next(null, Date.now() + '.' + Mime.getExtension(file.mimetype))
  }
})
MC.Multer = Multer(MC.MulterOptions)

// ////////////////////////////////////////////////////////////// Module Imports
// -----------------------------------------------------------------------------
require('@App/SiteContent')
require('@App/Result')
require('@App/Auth')

// ////////////////////////////////////////////////////////////// Initialize User
// -----------------------------------------------------------------------------
const initializeUser = async () => {
  const email = process.env.SURF_USERNAME
  const password = process.env.SURF_PWD
  
  if (!email || !password) {
    console.log('⚠️  [User Init] SURF_USERNAME or SURF_PWD not set, skipping user initialization')
    return
  }
  
  try {
    const user = await MC.Model.User.find({ email })
    if (!user || user.length === 0) {
      await MC.Model.User.create({ email, password })
      console.log(`✅ [User Init] Created new user: ${email}`)
    }
  } catch (error) {
    console.error('❌ [User Init] Error initializing user:', error)
  }
}; initializeUser()

// //////////////////////////////////////////////////////////// Useful Functions
// -----------------------------------------------------------------------------
// --------------------------------------------------------------- Hash password
// const Bcrypt = require('bcryptjs')
// Bcrypt.hash('<password>', 12, function(err, hash) {
//   console.log(hash)
// })

// -------------------------------------------------------- Update existing user
const updateExistingUser = async () => {
  const email = process.env.SURF_USERNAME
  const password = process.env.SURF_PWD
  const user = await MC.Model.User.find({ email })
  console.log(user[0])
  if (user.length > 0) {
    user[0].password = password
    await user[0].save()
  } else {
    await MC.Model.User.create({ email, password })
  }
}; // updateExistingUser()

// --------------------------------------------------------------- Get user list
const getUserList = async () => {
  const users = await MC.Model.User.find({})
  console.log(users)
}; // getUserList()

// ------------------------------------------------------ Parse and modify a CSV
const modifyCsv = async () => {
  const CsvToJson = require('csvtojson')
  const Papa = require('papaparse')
  const Fs = require('fs')
  const compiled = []
  const header = 'First Author,Year,Country,Design,Outcome,Population - Primary,Population - Original,Risk Factor - Category,Risk Factor - Primary,Risk Factor - Secondary,Risk Factor - Original,Comparator,Estimator,Size Effect,Confidence Interval,P Value,Paper Title,Paper DOI,Paper PMID,Paper Web Link'
  CsvToJson()
    .fromFile(`${MC.appRoot}/data/uploads/results.csv`)
    .then((results) => {
      // console.log(results[1])
      const len = results.length
      // console.log(len)
      for (let i = 0; i < len; i++) {
        const result = results[i]

        const value = result['Confidence Interval']
        const pattern = /CI[0-9]{0,9}[\s\t]?\[\s?-?[0-9]{1,8}\.?([0-9]{1,8})?,\s?-?[0-9]{1,8}\.?([0-9]{1,8})?\s?]/
        const regex = new RegExp(pattern)
        if (!regex.test(value)) {
          console.log(`${i + 2}`, result['First Author'], `"${value}"`)
          // console.log(value)
        }
        // if (value !== '' && !regex.test(value)) { state = 'error' }
        // return { state, validation: 'pattern' }

        // const split = result['Confidence Interval'].split(' to ') // –
        // if (split.length === 2) {
        //   // console.log(`${i + 2}`, result['First Author'], split.length, split)
        //   // result['Confidence Interval'] = split.join(',')
        // }
      }
      // const csv = Papa.unparse(results)
      // console.log(csv)
    })
}; // modifyCsv()

const getResults = async () => {
  const response = await MC.Model.Result.find({
    sizeEffect: {
      $gte: 300,
      $lte: 500
    }
  })
  const compiled = []
  const len = response.length
  console.log(len)
  for (let i = 0; i < len; i++) {
    compiled.push(response[i].sizeEffect)
  }
  compiled.sort((a, b) => a - b)
  // console.log(compiled.slice(-100))
  console.log(compiled)
} // getResults()
