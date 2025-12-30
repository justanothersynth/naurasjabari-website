// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const { GenerateFilters } = require('@App/Result/helpers')
const QueryBuilder = require('@App/Result/query-builder')
const SendData = require('@Utilities/send-data')
const ProcessError = require('@Utilities/process-error')
const Stream = require('stream')
const CsvToJson = require('csvtojson')
const Path = require('path')
const Fs = require('fs')
const Archiver = require('archiver')
const CamelCase = require('lodash/camelCase')

const MC = require('@Root/config')
let write = null

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
// //////////////////////////////////////////////////////////////// CheckHeaders
const CheckHeaders = (headers, row, filePath) => {
  const incorrect = []
  Object.keys(row).map((key) => {
    if (!headers.hasOwnProperty(key) && !headers.hasOwnProperty(CamelCase(key))) {
      incorrect.push(key)
    }
  })
  const len = incorrect.length
  if (len > 0) {
    let message = 'Headers '
    for (let i = 0; i < len; i++) {
      message += `\"${incorrect[i] }\", `
    }
    message += 'do not match'
    RemoveCsvFile(filePath)
    throw new Error(message)
  }
}

// ///////////////////////////////////////////////////////////////////// FixKeys
const FixKeys = (row) => {
  Object.keys(row).map((key) => {
    const camelCase = CamelCase(key)
    row[camelCase] = row[key]
    delete row[key]
  })
  return row
}

// //////////////////////////////////////////////////////////////////// IsNumber
const IsNumber = (n) => {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}

// ///////////////////////////////////////////////////////////// WriteToDatabase
const WriteToDatabase = async (row) => {
  row.status = 'PUBLISHED'
  return await MC.Model.Result.create(row)
}

// /////////////////////////////////////////////////////////////// RemoveCsvFile
const RemoveCsvFile = async (filePath) => {
  Fs.unlinkSync(filePath)
}

// ///////////////////////////////////////////////////////////////// MoveCsvFile
const MoveCsvFile = async (src, dest) => {
  Fs.rename(src, dest, (err) => {
    if (err) {
      console.log('================================ [Func: MoveCsvFile] ERROR ')
      console.log(err)
    }
  })
}

// //////////////////////////////////////////////////////////////// ArchiveFiles
const ArchiveFiles = () => {
  try {
    const zipname = 'surf-dataquery-files'
    const output = Fs.createWriteStream(`${MC.publicPath}/${zipname}.zip`)
    const files = [
      { path: Path.resolve(`${MC.dataPath}/uploads/estimator.csv`), distname: 'estimator.csv' },
      { path: Path.resolve(`${MC.dataPath}/uploads/outcome.csv`), distname: 'outcome.csv' },
      { path: Path.resolve(`${MC.dataPath}/uploads/results.csv`), distname: 'results.csv' }
    ]
    const Archive = Archiver('zip')
    output.on('close', () => { console.log('🏁 Archiving files complete') })
    Archive.pipe(output)
    files.forEach((file) => {
      const path = file.path
      const name = path.split('/').pop()
      Archive.file(path, { name })
    })
    Archive.finalize()
  } catch (e) {
    console.log('======================================== [Func: ArchiveFiles]')
    console.log(e)
  }
}

// ///////////////////////////////////////////////////////////////// ModifyQuery
const ModifyQuery = async (filters) => {
  function swapMatches (item, key) {
    const filter = item[key]
    if (filter.hasOwnProperty('$in')) {
      const defs = MC.filters[key].definitions
      Object.keys(defs).map((defKey) => {
        if (defs[defKey].name === filter.$in[0]) {
          filter.$in = defs[defKey].matches
        }
      })
    }
  }
  return new Promise((resolve, reject) => {
    const $and = filters.$and
    Object.keys($and).map((key) => {
      const item = $and[key]
      if (item.hasOwnProperty('estimator')) {
        swapMatches(item, 'estimator')
      } else if (item.hasOwnProperty('outcome')) {
        swapMatches(item, 'outcome')
      }
    })
    resolve(filters)
  })
}

// /////////////////////////////////////////////////////////////////// Endpoints
// -----------------------------------------------------------------------------
// ////////////////////////////////////////////////////////////////// CSV Upload
MC.App.post('/result-csv-upload', MC.Multer.single('csv-file'), (req, res, expressNext) => {
  const file = req.file
  if (file) {
    SendData(res, 200, 'File uploaded successfully', file)
  } else {
    ProcessError(res, 403, 'This operation requires you to be logged in.')
  }
})

// ///////////////////////////////////////////////////////////////// Process CSV
/*
 *
 * Instructions for pausing every n operations
 * -- https://github.com/Keyang/node-csvtojson/issues/135
 *
 * NodeJS Streams
 * -- https://nodejs.org/api/stream.html#stream_simplified_construction
 *
 */

MC.App.get('/results-process-csv', (req, res, expressNext) => {
  const src = `${MC.publicPath}/csv/${Fs.readdirSync(`${MC.publicPath}/csv`).pop()}`
  const dest = `${MC.dataPath}/uploads/results.csv`
  const FileStream = Fs.createReadStream(src)

  const headers = {
    firstAuthor: 'First Author',
    year: 'Year',
    country: 'Country',
    design: 'Design',
    outcome: 'Outcome',
    populationPrimary: 'Population - Primary',
    populationOriginal: 'Population - Original',
    riskFactorCategory: 'Risk Factor - Category',
    riskFactorPrimary: 'Risk Factor - Primary',
    riskFactorSecondary: 'Risk Factor - Secondary',
    riskFactorOriginal: 'Risk Factor - Original',
    comparator: 'Comparator',
    estimator: 'Estimator',
    sizeEffect: 'Size Effect',
    confidenceInterval: 'Confidence Interval',
    pValue: 'P Value',
    paperTitle: 'Paper Title',
    paperDoi: 'Paper DOI',
    paperPmid: 'Paper PMID',
    paperWebLink: 'Paper Web Link'
  }

  const databaseWriteErrors = []
  const json = []

  let processCount = 0
  let writtenCount = 0

  const write = new Stream.Writable({
    write: async (row, encoding, next) => {
      try {
        if (processCount === 0) { await CheckHeaders(headers, row, src) }
        const fixed = FixKeys(row)
        if (fixed.hasOwnProperty('confidenceInterval')) {
          fixed.confidenceInterval = fixed.confidenceInterval.replace(' ', '').replace('––', ',')
        }
        if (fixed.hasOwnProperty('sizeEffect')) {
          const float = parseFloat(fixed.sizeEffect)
          fixed.sizeEffect = IsNumber(float) ? float : null
        }
        const response = await WriteToDatabase(fixed)
        if (response) { writtenCount++ }
        json.push(response)
        processCount++
        return next()
      } catch (e) {
        console.log('=================== CSV Stream.Writable Error')
        console.log(e.message)
        databaseWriteErrors.push(processCount + 2)
        processCount++
        if (e.name !== 'ValidationError') { return write.destroy(e) }
        return next()
      }
    },
    objectMode: true,
    autoDestroy: false
  })

  MC.MongooseConnection
    .db()
    .listCollections({ name: 'results' })
    .next(function(err, collection) {
      if (collection) {
        MC.MongooseConnection.db().dropCollection('results')
        FileStream
          .pipe(CsvToJson({}, { objectMode: true }))
          .pipe(write)
          // Stream completed with no errors or destroys
          .on('finish', (response) => {
            console.log(`======== CSV Processing Complete`)
            console.log(`======== PROCESSED: ${processCount}, WRITTEN: ${writtenCount}, ERRORS: ${databaseWriteErrors.length} [lines: ${databaseWriteErrors}]`)
            GenerateFilters('population', json)
            GenerateFilters('riskFactor', json)
            GenerateFilters('_singulars_', json) // year, size-effect, country, first-author
            MoveCsvFile(src, dest)
            ArchiveFiles()
            SendData(res, 200, `${processCount} results processed and ${writtenCount} results saved to database | ERRORS: ${databaseWriteErrors.length} [lines: ${databaseWriteErrors}]`)
          })
          // Any error occurs, including destroying the stream
          .on('error', (e) => {
            console.log('======== CSV FileStream Error')
            console.log(e.message)
            console.log(`======== PROCESSED: ${processCount}, WRITTEN: ${writtenCount}, ERRORS: ${databaseWriteErrors.length}`)
            Fs.exists(src, (exists) => {
              if (exists) {
                RemoveCsvFile(src)
              }
            })
            ProcessError(res, 200, `${processCount} results processed, ${writtenCount} imported, ${databaseWriteErrors.length} errors [lines: ${databaseWriteErrors}], error: ${e.message}`, e.message)
          })
      }
    })
})

// //////////////////////////////////////////////////////// Process Grouping CSV
/*
 *
 * Instructions for pausing every n operations
 * -- https://github.com/Keyang/node-csvtojson/issues/135
 *
 * NodeJS Streams
 * -- https://nodejs.org/api/stream.html#stream_simplified_construction
 *
 */

MC.App.get('/grouping-process-csv', (req, res, expressNext) => {
  const grouping = req.query.grouping
  const src = `${MC.publicPath}/csv/${Fs.readdirSync(`${MC.publicPath}/csv`).pop()}`
  const dest = `${MC.dataPath}/uploads/${grouping}.csv`
  const FileStream = Fs.createReadStream(src)
  let headers = {}

  if (grouping === 'outcome') {
    headers = {
      key: 'Key',
      label: 'Label',
      primary: 'Primary',
      secondary: 'Secondary'
    }
  } else if (grouping === 'estimator') {
    headers = {
      type: 'Type',
      match: 'Match',
      description: 'Description',
      name: 'Name',
      label: 'Label',
      key: 'Key'
    }
  }

  const json = []
  let processCount = 0

  const write = new Stream.Writable({
    write: async (row, encoding, next) => {
      try {
        if (processCount === 0) { await CheckHeaders(headers, row, src) }
        const fixed = FixKeys(row)
        json.push(row)
        processCount++
        return next()
      } catch (e) {
        console.log('=============================== CSV Stream.Writable Error')
        processCount++
        if (e.name !== 'ValidationError') { return write.destroy(e) }
        return next()
      }
    },
    objectMode: true,
    autoDestroy: false
  })

  FileStream
    .pipe(CsvToJson({}, { objectMode: true }))
    .pipe(write)
    // Stream completed with no errors or destroys
    .on('finish', (response) => {
      GenerateFilters(grouping, json)
      MoveCsvFile(src, dest)
      ArchiveFiles()
      SendData(res, 200, `${grouping} processed`)
    })
    // Any error occurs, including destroying the stream
    .on('error', (e) => {
      console.log('====================================== CSV FileStream Error')
      console.log(e.message)
      Fs.exists(src, (exists) => {
        if (exists) {
          RemoveCsvFile(src)
        }
      })
      ProcessError(res, 200, `${grouping} processing error`, e.message)
    })
})

// //////////////////////////////////////////////////////////// Get Result Count
MC.App.get('/get-result-count', async (req, res, expressNext) => {
  try {
    const count = await MC.Model.Result.estimatedDocumentCount()
    SendData(res, 200, 'Result count retrieved successfully', count)
  } catch (e) {
    return ProcessError(res, 404, 'Result count could not be retrieved')
  }
})

// ///////////////////////////////////////////////////////////////// Get Filters
MC.App.get('/get-filters', (req, res, expressNext) => {
  const filter = req.query.filter
  try {
    const file = Fs.readFileSync(`${MC.appRoot}/data/filters/${filter}.json`)
    SendData(res, 200, 'Filters retreived successfully', JSON.parse(file))
  } catch (e) {
    return ProcessError(res, 404, 'Filters have not been set')
  }
})

// ///////////////////////////////////////////////////////////////// Get Filters
MC.App.post('/get-result-list', async (req, res, expressNext) => {
  const filters = req.body.filters
  console.log(filters)
  try {
    QueryBuilder(filters, async (p) => {
      console.log('=================================================== Results')
      const response = await MC.Model.Result.find(p.filters)
      console.log(response.length)
      SendData(res, 200, 'Results retreived successfully', response)
    })
  } catch (e) {
    return ProcessError(res, 404, 'Results could not be retrieved')
  }
})
