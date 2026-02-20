console.log(`📦 [Module] Database`)

// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const Mongoose = require('mongoose')
const MongooseSlugUpdater = require('mongoose-slug-updater')

const MC = require('@Root/config')

// ///////////////////////////////////////////////////////// Mongoose & DB Setup
// -----------------------------------------------------------------------------
//////////////////////////////////////////////////////////////////////// Plugins
Mongoose.plugin(MongooseSlugUpdater)

///////////////////////////////////////////////// Initialize Mongoose Connection
Mongoose
  .connect(MC.Database, MC.MongoConnectionOptions)
  .then(res => {
    console.log(`💽 [MongoDB] ${MC.Database}`)
    MC.MongooseConnection = res.mongoose.connection.getClient()
    MC.App.emit('mongoose-connected')
  }).catch((err) => {
    console.log(Error, err)
  })
