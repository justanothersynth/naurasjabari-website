module.exports = (res, code, message, payload) => {
  res.status(code)
  res.json({
    code,
    message,
    payload
  })
}
