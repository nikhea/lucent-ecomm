import { v2 as cloudinary } from 'cloudinary'
import { createReadStream } from 'fs'
import sharp from 'sharp'

export { cloudinary, sharp }

export const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || process.env.CLOUD_FOLDER || 'lucent'

export const hasCloudinaryEnv =
  !!process.env.CLOUDINARY_URL ||
  (!!process.env.CLOUD_NAME && !!process.env.CLOUD_API_KEY && !!process.env.CLOUD_API_SECRET) ||
  (!!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY)

if (hasCloudinaryEnv) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(true)
    cloudinary.config({ secure: true })
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
}

export const cloudinaryAdapter = () => ({
  name: 'cloudinary',
  async handleUpload({ file }: any) {
    if (!hasCloudinaryEnv) return
    const baseName = file.filename.replace(/\.[^/.]+$/, '')
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 100)
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          public_id: safeName,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          ...(process.env.CLOUDINARY_UPLOAD_PRESET ? { upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET } : {}),
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      if (file.buffer) stream.end(file.buffer)
      else if (file.tempFilePath) createReadStream(file.tempFilePath).pipe(stream)
      else stream.end()
    })
    if (result) {
      file.filename = result.public_id ? `${result.public_id.split('/').pop()}.${result.format}` : file.filename
      ;(file as any).public_id = result.public_id
      ;(file as any).cloudinaryUrl = result.secure_url
      file.mimeType = result.resource_type === 'image' ? `image/${result.format}` : file.mimeType
      file.filesize = result.bytes
    }
  },
  async handleDelete({ doc, filename }: any) {
    if (!hasCloudinaryEnv || !filename) return
    const publicId = (doc as any)?.public_id || `${cloudinaryFolder}/${filename.replace(/\.[^/.]+$/, '')}`
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    } catch {}
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
    } catch {}
  },
  generateURL: ({ filename }: any) => {
    if (!filename) return ''
    const nameNoExt = filename.replace(/\.[^/.]+$/, '')
    try {
      return cloudinary.url(`${cloudinaryFolder}/${nameNoExt}`, { secure: true, resource_type: 'image' })
    } catch {
      return `https://res.cloudinary.com/${process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cloudinaryFolder}/${filename}`
    }
  },
  staticHandler: () => new Response('Not implemented', { status: 501 }),
})

export const generateCloudinaryURL = (filename: string) => {
  if (!filename) return ''
  const nameNoExt = filename.replace(/\.[^/.]+$/, '')
  try {
    return cloudinary.url(`${cloudinaryFolder}/${nameNoExt}`, { secure: true, resource_type: 'image' })
  } catch {
    return `https://res.cloudinary.com/${process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cloudinaryFolder}/${filename}`
  }
}
