#!/usr/bin/env node

import { Avatar, AvatarLayerStack } from '@openavatar/types'

import fs from 'fs'
import { AvatarAssets } from '../src/gen0/AvatarAssets'
import { Base64PNGURI } from '../src/gen0/AvatarSpriteAssets'

import { PixelBlender, RGBA, Texture } from '../src/lib'
import { PNG } from '../src/lib/PNG'
import { JimpReader } from '../src/render/read/ImageReader'
import { AvatarSequenceAnimation } from './animations/Animation'
import redhead_tanning from './animations/redhead_tanning'
import simple_start from './animations/simple_start'

async function main(args: string[]) {
  if (args.length > 0) {
    console.error('Usage: animate.ts')
    process.exit(1)
  }

  const animations: Record<string, AvatarSequenceAnimation> = {
    redhead_tanning: redhead_tanning,
    simple_start: simple_start,
  }

  Object.keys(animations).forEach(async (animationName: string) => {
    const animation: AvatarSequenceAnimation = animations[animationName]
    // delete anything in the output directory already
    fs.mkdirSync(`./artifacts/animations/${animationName}`, { recursive: true })
    fs.rmdirSync(`./artifacts/animations/${animationName}`, { recursive: true })
    fs.mkdirSync(`./artifacts/animations/${animationName}`, { recursive: true })

    for (let i = 0; i < animation.frames.length; i++) {
      const avatar: Avatar = animation.frames[i]

      const texturesByLayer: Record<string, Texture> = {}
      for (const layer of AvatarLayerStack.iter()) {
        const sprite: Base64PNGURI = AvatarAssets.getSprite(avatar, layer)
        const parsed: string = sprite.replace(/^data:image\/png;base64,/, '')
        const png: Buffer = Buffer.from(parsed, 'base64')
        // parse PNG
        // we're going to need to write it to disk and read it back unfortunately
        const tmpFilename = `/tmp/${avatar.dna.toString()}-${layer.name}.png`
        fs.writeFileSync(tmpFilename, png)

        const texture: Texture = await new JimpReader(tmpFilename).read()
        texturesByLayer[layer.name] = texture
      }

      const composite: Buffer = Buffer.alloc(32 * 32 * 4)
      for (const layer of AvatarLayerStack.iter()) {
        const texture: Texture = texturesByLayer[layer.name]
        const data: Uint8Array = texture.data
        const buffer: Buffer = Buffer.from(data)

        for (let y = 0; y < texture.properties.size.height; y++) {
          for (let x = 0; x < texture.properties.size.width; x++) {
            const offset = (y * texture.properties.size.width + x) * 4
            const overlay: RGBA = {
              r: buffer[offset + 0],
              g: buffer[offset + 1],
              b: buffer[offset + 2],
              a: buffer[offset + 3],
            }
            const base: RGBA = {
              r: composite[offset + 0],
              g: composite[offset + 1],
              b: composite[offset + 2],
              a: composite[offset + 3],
            }
            const blend: RGBA = PixelBlender.blend(base, overlay)
            composite[offset + 0] = blend.r
            composite[offset + 1] = blend.g
            composite[offset + 2] = blend.b
            composite[offset + 3] = blend.a
          }
        }
      }

      // AvatarConsoleDrawer.draw(composite)

      const encodedPNG: Uint8Array = PNG.encodePNG(composite, 32, 32, true)
      // write to disk
      const framePngFile = `./artifacts/animations/${animationName}/${animationName}__frame${i}.png`
      console.log(framePngFile.slice(2))
      fs.writeFileSync(framePngFile, Buffer.from(encodedPNG))
    }
  })
}

main(process.argv.slice(2))
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🛠️   Done!')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
