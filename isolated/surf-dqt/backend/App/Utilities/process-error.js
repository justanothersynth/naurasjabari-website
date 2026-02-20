module.exports = (res, code, message, error) => {
  res.status(code)
  res.json({
    code,
    message,
    error
  })
}
