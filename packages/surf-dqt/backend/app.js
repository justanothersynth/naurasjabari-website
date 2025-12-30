// //////////////////////////////////////////////////// Imports + variable setup
// -----------------------------------------------------------------------------
const ModuleAlias = require('module-alias')
const Dotenv = require('dotenv').config()
const Helmet = require('helmet')
const Fs = require('fs')

//////////////////////////////////////////////////////////////////////// Aliases
ModuleAlias.addAliases({
  '@Root' : __dirname,
  '@App': __dirname + '/App',
  '@Models': __dirname + '/App/Models',
  '@Utilities': __dirname + '/App/Utilities'
})

/////////////////////////////////////////////////////////////////// Base imports
const Express = require('express')
const MC = require('@Root/config')

MC.Server = {
  http: require('http'),
  https: require('https'),
  instance: false
}

////////////////////////////////////////////////////////////////////// Variables
const publicPath = MC.publicPath
const publicDirectories = MC.publicDirectories

// //////////////////////////////////////////////////// Check for .env variables
// -----------------------------------------------------------------------------
if (!process.env.EXPRESS_SESSION_SECRET) {
  throw new Error('EXPRESS_SESSION_SECRET .env variable is missing')
}

// ///////////////////////////////////////////////////////// Initialize Database
// -----------------------------------------------------------------------------
/*
 * Database Module is the only module that must be imported in app.js
*/
require('@App/Database')

// ////////////////////////////////////////////////////////////// Initialize App
// -----------------------------------------------------------------------------
MC.App = Express()
MC.App.use(Helmet({
  crossOriginResourcePolicy: false
}))

// //////////////////////////////////////////////////// Initialize Public Folder
// -----------------------------------------------------------------------------
const dirCount = publicDirectories.length
for (let i = 0; i < dirCount; i++) {
  const dir = `${publicPath}/${publicDirectories[i]}`
  if (!Fs.existsSync(dir)) { Fs.mkdirSync(dir) }
}

MC.App.use(Express.static(MC.publicPath))

// ///////////////////////////////////////////////////////////////////// Liftoff
// -----------------------------------------------------------------------------
const liftoff = () => {
  console.log(`🤖 [Server] ${MC.backendUrl}`)
  require('@App/liftoff')
}

MC.App.on('mongoose-connected', () => {
  // Create server instance
  MC.Server.instance = process.env.SERVER_ENV === 'development' ?
  // -- development
  MC.Server.https.createServer({
    key: Fs.readFileSync(`${MC.appRoot}/localhost_key.pem`, 'ascii'),
    cert: Fs.readFileSync(`${MC.appRoot}/localhost_cert.pem`, 'ascii')
  }, MC.App).listen(MC.port, liftoff) :
  // -- production
  MC.App.listen(MC.port, liftoff)
})
