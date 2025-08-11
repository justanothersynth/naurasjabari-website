import { api as uploadFile } from '../lib/files/upload-file'
import { api as downloadFile } from '../lib/files/download-file'

import { api as generateJwt } from '../lib/auth/generate-jwt'

import { api as createLocation } from '../lib/sun-moon/create-location'
import { api as createEntry } from '../lib/geostorm/create-entry'

export const router = {
  file: {
    upload: uploadFile,
    download: downloadFile
  },
  auth: {
    generateJwt
  },
  sunMoon: {
    createLocation
  },
  geostorm: {
    createEntry
  }
}
