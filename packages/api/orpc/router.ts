import { api as uploadFile } from '../lib/files/upload-file'
import { api as downloadFile } from '../lib/files/download-file'

import { api as generateJwt } from '../lib/auth/generate-jwt'

export const router = {
  file: {
    upload: uploadFile,
    download: downloadFile
  },
  auth: {
    generateJwt
  }
}
