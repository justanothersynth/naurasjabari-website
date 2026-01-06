// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const Fs = require('fs-extra')
const { v4: UUIDv4 } = require('uuid')
const CloneDeep = require('lodash/cloneDeep')

const MC = require('@Root/config')
const filtersPath = `${MC.appRoot}/data/filters`

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
// /////////////////////////////////////////////////////// [Generate] Population
const GeneratePopulationFilters = async (data) => {
  const path = `${filtersPath}/population.json`
  const file = JSON.parse(await Fs.readFileSync(path))
  const len = data.length
  const compiled = []
  for (let i = 0; i < len; i++) {
    const populationPrimary = data[i].populationPrimary
    if (populationPrimary !== '' && !compiled.find(obj => obj.name === populationPrimary)) {
      compiled.push({
        id: UUIDv4(),
        name: populationPrimary
      })
    }
  }
  file.options = compiled
  await Fs.writeFileSync(path, JSON.stringify(file, false, 2))
  return true
}

// ////////////////////////////////////////////////////// [Generate] Risk Factor
const GenerateRiskFactorFilters = async (data) => {
  const path = `${filtersPath}/risk-factor.json`
  const file = JSON.parse(await Fs.readFileSync(path))
  const len = data.length
  const compiled = []
  for (let i = 0; i < len; i++) {
    const entry = data[i]
    const riskFactorCategory = entry.riskFactorCategory
    const riskFactorPrimary = entry.riskFactorPrimary
    if (riskFactorCategory !== '' && riskFactorPrimary !== '' && !compiled.find(obj => obj.category === riskFactorCategory)) {
      compiled.push({
        id: UUIDv4(),
        category: riskFactorCategory,
        filterDatabaseKey: 'riskFactorCategory',
        matches: [{
          id: UUIDv4(),
          name: riskFactorPrimary,
          filterDatabaseKey: 'riskFactorPrimary',
        }]
      })
    } else if (riskFactorCategory !== '' && riskFactorPrimary !== '') {
      const index = compiled.findIndex(obj => obj.category === riskFactorCategory)
      if (index !== -1 && !compiled[index].matches.find(obj => obj.name === riskFactorPrimary)) {
        compiled[index].matches.push({
          id: UUIDv4(),
          name: riskFactorPrimary,
          filterDatabaseKey: 'riskFactorPrimary'
        })
      }
    }
  }
  file.options = compiled
  await Fs.writeFileSync(path, JSON.stringify(file, false, 2))
  return true
}

// ////////////////////////////////////////////////////////// [Generate] Outcome
const GenerateOutcomeFilters = async (data) => {
  const path = `${filtersPath}/outcome.json`
  const file = JSON.parse(await Fs.readFileSync(path))
  const len = data.length
  const compiled = {}
  for (let i = 0; i < len; i++) {
    const entry = data[i]
    const key = entry.key
    const label = entry.label
    const primary = entry.primary
    const secondary = entry.secondary
    if (!compiled.hasOwnProperty(key) && key !== '' && label !== '' && primary !== '' && secondary !== '') {
      compiled[key] = {
        label,
        primary,
        matches: [secondary]
      }
    } else if (key !== '' && label !== '' && primary !== '' && secondary !== '') {
      if (!compiled[key].matches.includes(secondary)) {
        compiled[key].matches.push(secondary)
      }
    }
  }
  file.definitions = compiled
  await Fs.writeFileSync(path, JSON.stringify(file, false, 2))
  return true
}

// //////////////////////////////////////////////////////// [Generate] Estimator
const GenerateEstimatorFilters = async (data) => {
  const path = `${filtersPath}/estimator.json`
  const file = JSON.parse(await Fs.readFileSync(path))
  const len = data.length
  const groups = []
  const definitions = {}
  for (let i = 0; i < len; i++) {
    const entry = data[i]
    const type = entry.type
    const match = entry.match
    const description = entry.description
    const name = entry.name
    const label = entry.label
    const key = entry.key
    if (type !== '' && match !== '') {
      if (type === 'group') {
        groups.push({
          definitions: match.split('|'),
          description
        })
      } else if (type === 'definition' && name !== '' && label !== '' && key !== '') {
        definitions[key] = {
          id: key,
          name,
          label,
          description,
          matches: match.split('|')
        }
      }
    }
  }
  file.groups = groups
  file.definitions = definitions
  await Fs.writeFileSync(path, JSON.stringify(file, false, 2))
  return true
}

// ///////////////////////// [Generate] Year, Country, Size Effect, First Author
const GenerateSingularFilters = async (data) => {
  const path_Year = `${filtersPath}/year.json`
  const path_Country = `${filtersPath}/country.json`
  const path_SizeEffect = `${filtersPath}/size-effect.json`
  const path_FirstAuthor = `${filtersPath}/first-author.json`
  const file_Year = JSON.parse(await Fs.readFileSync(path_Year))
  const file_Country = JSON.parse(await Fs.readFileSync(path_Country))
  const file_SizeEffect = JSON.parse(await Fs.readFileSync(path_SizeEffect))
  const file_FirstAuthor = JSON.parse(await Fs.readFileSync(path_FirstAuthor))
  const len = data.length
  const compiled = {
    year: [],
    country: [],
    sizeEffect: [],
    firstAuthor: []
  }
  for (let i = 0; i < len; i++) {
    const entry = data[i]
    const year = entry.year
    const country = entry.country
    const sizeEffect = entry.sizeEffect
    const firstAuthor = entry.firstAuthor
    if (!compiled.year.find(obj => obj.name === year)) {
      compiled.year.push({
        id: UUIDv4(),
        name: year
      })
    }
    if (!compiled.country.find(obj => obj.name === country)) {
      compiled.country.push({
        id: UUIDv4(),
        name: country
      })
    }
    if (!compiled.sizeEffect.find(obj => obj.name === sizeEffect)) {
      compiled.sizeEffect.push({
        id: UUIDv4(),
        name: sizeEffect
      })
    }
    if (!compiled.firstAuthor.find(obj => obj.name === firstAuthor)) {
      compiled.firstAuthor.push({
        id: UUIDv4(),
        name: firstAuthor
      })
    }
  }
  file_Year.options = compiled.year
  file_Country.options = compiled.country
  file_SizeEffect.options = compiled.sizeEffect
  file_FirstAuthor.options = compiled.firstAuthor
  await Fs.writeFileSync(path_Year, JSON.stringify(file_Year, false, 2))
  await Fs.writeFileSync(path_Country, JSON.stringify(file_Country, false, 2))
  await Fs.writeFileSync(path_SizeEffect, JSON.stringify(file_SizeEffect, false, 2))
  await Fs.writeFileSync(path_FirstAuthor, JSON.stringify(file_FirstAuthor, false, 2))
  return true
}

// ///////////////////////////////////////////////////////////// GenerateFilters
const GenerateFilters = async (key, data) => {
  switch (key) {
    case 'population' : await GeneratePopulationFilters(data); break
    case 'riskFactor' : await GenerateRiskFactorFilters(data); break
    case 'outcome' : await GenerateOutcomeFilters(data); break
    case 'estimator' : await GenerateEstimatorFilters(data); break
    case '_singulars_' : await GenerateSingularFilters(data); break // year, size-effect, country, first-author
  }
  return true
}

// ///////////////////////////////////////////////////////////////////// Exports
// -----------------------------------------------------------------------------
module.exports = {
  GenerateFilters
}
