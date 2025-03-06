import { ColorFormat } from '../lib'

export class AvatarConsoleDrawer {
  static draw(hex: string | Buffer | Uint8Array): void {
    if (hex instanceof Uint8Array) {
      hex = Buffer.from(hex)
    }
    if (hex instanceof Buffer) {
      hex = hex.toString('hex')
    }
    // should be a string now
    if (typeof hex !== 'string') {
      throw new Error(`renderHex returned ${hex} but should be a string`)
    }
    if (!hex.startsWith('0x')) {
      hex = '0x' + hex
    }
    const bytesPerPixel = ColorFormat.RGBA8.bytesPerPixel
    const strlen = '0x'.length + 2 * 32 * 32 * bytesPerPixel
    if (hex.length !== strlen) {
      throw new Error(`renderHex returned length ${hex.length} but should be ${strlen}`)
    }

    const buffer = Buffer.from(hex.substring(2), 'hex')

    process.stdout.write('\n')
    for (let i = 0; i < buffer.length; i += 4) {
      const red = buffer[i]
      const green = buffer[i + 1]
      const blue = buffer[i + 2]
      const alpha = buffer[i + 3]

      if (alpha === 0) {
        process.stdout.write('  ')
      } else if (red === 0 && green === 0 && blue === 0) {
        process.stdout.write('  ')
      } else if (red === 255 && green === 255 && blue === 255) {
        process.stdout.write('▓▓')
      } else if (red >= 240 && red === green && green === blue) {
        process.stdout.write('░░')
      } else {
        process.stdout.write(`\x1b[38;2;${red};${green};${blue}m@@\u001B[0m`)
      }

      if ((i + 4) % (32 * bytesPerPixel) === 0) {
        process.stdout.write('\n')
      }
    }

    process.stdout.write('\u001B[0m\n')
  }
}
