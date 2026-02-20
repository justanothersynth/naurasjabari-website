// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const { toRegex } = require('diacritic-regex')

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
const QueryBuilder = (filters, next) => {
  const mFilter = { filters, $and: [] }
  const mProjection = null
  const mOptions = {}
  len = 0
  //////////////////////////////////////////////////////////////// Apply filters
  const options = mFilter.filters
  len = options.length
  const $and = {}
  const $in = {}
  for (let i = 0; i < len; i++) {
    const option = options[i]
    const filter = option.filter
    const match = option.match
    const matches = option.matches
    const type = option.type
    const name = option.name ? option.name.trim() : false
    const regex = name ? toRegex({ flags: 'gi' })(name) : false
    // --------------------------------------------------------- Dropdown Single
    if (type === 'dropdown-single') {
      $and[filter] = match === 'exact' ? name : regex
    // ------------------------------------------------------- Dropdown Multiple
    } else if (type === 'dropdown-multiple') {
      if (!$in.hasOwnProperty(filter)) {
        $in[filter] = {
          $in: matches ? matches : [match === 'exact' ? name : regex]
        }
      } else {
        if (matches) {
          $in[filter].$in = $in[filter].$in.concat(matches)
        } else {
          $in[filter].$in.push(match === 'exact' ? name : regex)
        }
      }
    // -------------------------------------------------------------- Checkboxes
    } else if (type === 'checkboxes') {
      if (!$in.hasOwnProperty(filter)) {
        $in[filter] = {
          $in: matches
        }
      } else {
        $in[filter].$in = $in[filter].$in.concat(matches)
      }
    // ------------------------------------------------------------ Range Slider
    } else if (type === 'range-slider') {
      $and[filter] = {
        $gte: parseFloat(option.min),
        $lte: parseFloat(option.max)
      }
    }
  }
  mFilter.$and.push($in)
  mFilter.$and.push($and)
  delete mFilter.filters
  /////////////////////////////////////////////// Clear $and in mFilter if empty
  if (mFilter.$and.length === 0) {
    delete mFilter.$and
  }
  /////////////////////////////////////////////// ======================= Return
  return next({
    filters: mFilter,
    projections: mProjection,
    options: mOptions
  })
}

// ///////////////////////////////////////////////////////////////////// Exports
// -----------------------------------------------------------------------------
module.exports = QueryBuilder
