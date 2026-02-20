/*

⏱️️ [Cron | every day at 18:00] Archiver

The Archiver cron archives everything in the following directories:
- @/data
- @/public

*/

// ///////////////////////////////////////////////////// Imports + general setup
// -----------------------------------------------------------------------------
const Path = require('path')
const Dotenv = require('dotenv').config({ path: Path.resolve(__dirname, '../.env') })
const Fs = require('fs')
const ArchiverPackage = require('archiver')
const Moment = require('moment-timezone')
const Spawn = require('child_process').spawn

const MC = require('../config')

ARCHIVE_DIRECTORY = Path.resolve(`${MC.appRoot}/../${process.env.ARCHIVE_DIRECTORY}`)

const directories = [
  { path: Path.resolve(`${MC.appRoot}/data`), distname: 'data' },
  { path: Path.resolve(`${MC.appRoot}/public`), distname: 'public' }
]

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
// ////////////////////////////////////////////////////////////// backupDatabase
const backupDatabase = async () => {
  console.log('→ Database backup started')
  return new Promise((next, reject) => {
    const backupProcess = Spawn('mongodump', [
      `--db=${process.env.DATABASE_NAME}`,
      `--out=${MC.appRoot}/data`
    ])
    backupProcess.on('exit', (code, signal) => {
      if (code) { console.log(`Backup process exited with code: ${code}`); return next() }
      if (signal) { console.error(`Backup process killed with singal: ${signal}`); return next() }
      console.log('✓ Database backup complete')
      next()
    })
  })
}

// //////////////////////////////////////////////////////////////////// Archiver
const Archiver = async () => {
  console.log('🚀️ Archiving snapshot started')
  try {
    if (process.env.SERVER_ENV === 'production') {
      await backupDatabase()
    }
    const date = Moment().tz('UTC')
    const zipname = `${date.toISOString().split('T')[0]}T${date.hours()}-${date.minutes()}`
    const output = await Fs.createWriteStream(`${ARCHIVE_DIRECTORY}/${zipname}.zip`)
    const Archive = ArchiverPackage('zip')
    output.on('close', () => {
      console.log('🏁 Archiving snapshot complete')
      process.exit(0)
    })
    Archive.pipe(output)
    directories.forEach((directory) => {
      Archive.directory(directory.path, directory.distname)
    })
    Archive.finalize()
  } catch (e) {
    console.log('======================================== [Function: Archiver]')
    console.log(e)
  }
}

// ////////////////////////////////////////////////////////////////// Initialize
// -----------------------------------------------------------------------------
Archiver()
