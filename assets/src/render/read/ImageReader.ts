/* eslint-disable no-unused-vars */
import fs from 'fs'
import Jimp from 'jimp'
import path from 'path'
import { ColorFormat } from '../../lib/ImageProperties'
import { Texture } from '../../lib/Texture'

export interface TextureReader {
  read(): Promise<Texture>
}

export class JimpReader implements TextureReader {
  private readonly filename: string

  constructor(filename: string) {
    this.filename = filename

    // ensure file exists
    const dirname: string = path.dirname(this.filename)
    if (!fs.existsSync(dirname)) {
      throw new Error(`Directory ${dirname} does not exist`)
    }
    if (!fs.existsSync(this.filename)) {
      throw new Error(`Image file ${this.filename} does not exist`)
    }
    if (!this.filename.endsWith('.png')) {
      throw new Error(`Image file ${this.filename} is not a PNG`)
    }
  }

  read(): Promise<Texture> {
    return new Promise((resolve, reject) => {
      Jimp.read(this.filename, (err: Error | null, jimp: Jimp) => {
        if (err) {
          console.error(err)
          return reject(err)
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jimp.getBuffer(Jimp.MIME_PNG, (err: Error | null) => {
          if (err) {
            console.error(err)
            return reject(err)
          }

          const texture = new Texture(
            {
              size: {
                width: jimp.bitmap.width,
                height: jimp.bitmap.height,
              },
              colorFormat: ColorFormat.valueOf({
                bitsPerChannel: 8, // JIMP only supports 8-bit channels
                channels: jimp.hasAlpha() ? 4 : 3,
              }),
            },
            new Uint8Array(jimp.bitmap.data)
          )

          return resolve(texture)
        })
      })
    })
  }
}
