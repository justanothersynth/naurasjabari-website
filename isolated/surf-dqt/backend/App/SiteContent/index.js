console.log(`📦 [Module] SiteContent`)

// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
const Sharp = require('sharp')
const Fs = require('fs-extra')
const Mime = require('mime')

const SendData = require('@Utilities/send-data')

const MC = require('@Root/config')
const contentDir = `${MC.appRoot}/data/content`

// /////////////////////////////////////////////////////////////////// Functions
// -----------------------------------------------------------------------------
const flattenContent = (content) => {
  const flattened = {}
  const loop = (fields) => {
    fields.forEach((field) => {
      if (field.type === 'group') {
        loop(field.fields)
      } else {
        flattened[field.id] = field
      }
    })
  }; loop(content)
  return flattened
}

// /////////////////////////////////////////////////////////////////// Endpoints
// -----------------------------------------------------------------------------
// ////////////////////////////////////////////////////////////// GetSiteContent
MC.App.get('/get-site-content', async (req, res, expressNext) => {
  const flatten = req.query.flatten
  const files = await Fs.readdirSync(`${contentDir}`)
  const compiled = {}
  files.filter(filename => filename.includes('.json')).forEach((filename) => {
    let file = JSON.parse(Fs.readFileSync(`${contentDir}/${filename}`))
    if (flatten === 'true') {
      file = flattenContent(file)
    }
    const key = filename.split('.')[0]
    compiled[key] = file
  })
  SendData(res, 200, 'Content retrieved successfully', compiled)
})

// ///////////////////////////////////////////////////////////// PostSiteContent
MC.App.post('/post-site-content', async (req, res, expressNext) => {
  const body = req.body
  const slug = body.slug
  const form = body.form
  await Fs.writeFileSync(`${contentDir}/${slug}.json`, JSON.stringify(form, null, 2))
  SendData(res, 200, 'Content submitted successfully', form)
})

// ///////////////////////////////////////////////////////////// PostSiteContent
MC.App.post('/post-image', MC.Multer.single('media'), async (req, res, expressNext) => {
  const file = req.file
  const host = req.protocol + '://' + req.headers.host
  const mimeSplit = file.mimetype.split('/')
  const format = mimeSplit[0]
  const extension = mimeSplit[1].split('+')[0] || mimeSplit[1]
  const sizes = [64, 128, 256, 512, 1024, 2048]
  const filename = file.filename
  const namespace = req.body.namespace
  const newFileName = `${req.body.section_id.replace(/_/g, '-')}.${Mime.getExtension(file.mimetype)}`

  if (format === 'image' && extension !== 'svg') {
    const imgFile = `${MC.publicPath}/image/original/${namespace}-${newFileName}`
    await Fs.rename(`${MC.publicPath}/image/original/${filename}`, imgFile)

    var resize = size => Sharp(imgFile)
      .resize(size)
      .toFile(`${MC.publicPath}/image/thumb${size}/${namespace}-${newFileName}`)

    Promise
      .all(sizes.map(resize))
      .then(data => {
        SendData(res, 200, 'File uploaded successfully', `${namespace}-${newFileName}`)
      }).catch(err => { console.log(err) })
  }
})
