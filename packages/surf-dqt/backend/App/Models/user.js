//////////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const Mongoose = require('mongoose')
const Schema = Mongoose.Schema
const Bcrypt = require('bcryptjs')

///////////////////////////////////////////////////////////////////////// Schema
// -----------------------------------------------------------------------------
var UserSchema = new Schema({
  email: {
    type: String,
    required: allowEmptyStringsOnly,
    default: '',
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  minimize: false
})

///////////////////////////////////////////////////////////////// Before Actions
// -----------------------------------------------------------------------------
UserSchema.pre('save', function (next) {
  next()
  // const User = this
  // if (!User.isModified('password')) { return next() }
  // User.password
  // Bcrypt.hashSync(User.password, Bcrypt.genSaltSync(12), function (err, hash) {
  //   if (err) { return next(err) }
  //   User.password = hash
  //   next()
  // })
})

UserSchema.static('verifyPassword', function (password, user, next) {
  if (password === user.password) { return next(true) }
  return next(false)
  // Bcrypt.compare(password, user.password, function (err, isMatch) {
  //   if (err) { return next(err) }
  //   next(isMatch)
  // })
})

////////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
function allowEmptyStringsOnly () {
  return typeof this.email === 'string' ? false : true
}

///////////////////////////////////////////////////////////////////////// Export
// -----------------------------------------------------------------------------
module.exports = Mongoose.model('User', UserSchema)
