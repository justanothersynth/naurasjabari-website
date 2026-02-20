// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const Mongoose = require('mongoose')
const Schema = Mongoose.Schema

// ////////////////////////////////////////////////////////////////////// Schema
// -----------------------------------------------------------------------------
const ResultSchema = new Schema({
  firstAuthor: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  design: {
    type: String,
    required: false
  },
  outcome: {
    type: String,
    required: true
  },
  populationPrimary: {
    type: String,
    required: false
  },
  populationOriginal: {
    type: String,
    required: false
  },
  riskFactorCategory: {
    type: String,
    required: false
  },
  riskFactorPrimary: {
    type: String,
    required: false
  },
  riskFactorSecondary: {
    type: String,
    required: false
  },
  riskFactorOriginal: {
    type: String,
    required: false
  },
  comparator: {
    type: String,
    required: false
  },
  estimator: {
    type: String,
    required: true
  },
  sizeEffect: {
    type: Number,
    required: true
  },
  confidenceInterval: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        if (v === '') { return true }
        return /CI[0-9]{0,9}[\s\t]?\[\s?-?[0-9]{1,8}\.?([0-9]{1,8})?,\s?-?[0-9]{1,8}\.?([0-9]{1,8})?\s?]/.test(v)
      },
      message: props => `${props.value} is not a valid CI entry`
    }
  },
  pValue: {
    type: String,
    required: false
  },
  paperTitle: {
    type: String,
    required: false
  },
  paperDoi: {
    type: String,
    required: false
  },
  paperPmid: {
    type: String,
    required: false
  },
  paperWebLink: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['DRAFT', 'PUBLISHED']
  }
}, {
  collation: {
    locale: 'en',
    strength: 1 // Comparison -- 1 = chars only, 2 = chars and diacritics
  },
  timestamps: true
})

// ////////////////////////////////////////////////////////////////////// Export
// -----------------------------------------------------------------------------
module.exports = Mongoose.model('Result', ResultSchema)
