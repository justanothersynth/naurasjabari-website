// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const SendData = require('@Utilities/send-data')
const ProcessError = require('@Utilities/process-error')
const JsonWebToken = require('jsonwebtoken')

const MC = require('@Root/config')

// /////////////////////////////////////////////////////////////////// Endpoints
// -----------------------------------------------------------------------------
// ----------------------------------------------------------------------- Login
MC.App.post('/login', async (req, res, expressNext) => {
  try {
    const user = await MC.Model.User.findOne({ email: req.body.email })
    if (!user) { return SendData(res, 200, 'Your username or password is incorrect', false) }
    MC.Model.User.verifyPassword(req.body.password, user, (isValid) => {
      if (isValid) {
        const signed = JsonWebToken.sign(
          { id: user._id, iat: Date.now() },
          MC.App.JwtOptions.secretOrKey,
          { expiresIn: '1d' }
        )
        const token = `Bearer ${signed}`
        return SendData(res, 200, 'Login successful', token)
      }
      SendData(res, 200, 'Your username or password is incorrect', false)
    })
  } catch (e) {
    console.log('============================================== route [/login]')
    console.log(e)
  }
})

// ---------------------------------------------------------------- Authenticate
MC.App.get('/authenticate', MC.Passport.authenticate('jwt'), async (req, res, expressNext) => {
  const user = req.user
  if (user) { return SendData(res, 200, 'Login successful', true) }
  ProcessError(res, 403, 'There was an error while trying to log you in. Try again or contact the application administrator.')
})
