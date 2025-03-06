import { LayerDescriptor } from '../core/Layer'
import { AvatarLayerStack } from './AvatarLayerStack'

type PatternPaletteIndex = {
  pattern: number
  palette: number
}

const BYTE_OFFSET: { [key: string]: PatternPaletteIndex } = {}
let i = 0
for (const layer of AvatarLayerStack.iter()) {
  BYTE_OFFSET[layer.name] = {
    pattern: i++,
    palette: i++,
  }
}

const CHAR_OFFSET: { [key: string]: PatternPaletteIndex } = {}
i = 0
for (const layer of AvatarLayerStack.iter()) {
  CHAR_OFFSET[layer.name] = {
    pattern: BYTE_OFFSET[layer.name].pattern * 2,
    palette: BYTE_OFFSET[layer.name].palette * 2,
  }
}

const OFFSET: {
  byte: { [key: string]: PatternPaletteIndex }
  char: { [key: string]: PatternPaletteIndex }
} = {
  byte: BYTE_OFFSET,
  char: CHAR_OFFSET,
}

export type DNALike = DNA | Buffer | string | Record<string, PatternPaletteIndex>

function hexify(value: number): string {
  // the maximum value of a byte is 255
  if (value < 0 || value > Math.pow(2, 8) - 1) {
    throw new Error(`Invalid byte: ${value}`)
  }
  // convert to hex and pad with 0 if necessary
  return value.toString(16).padStart(2, '0')
}

type OptionalPatternPaletteIndexes = Record<string, { pattern?: number; palette?: number }>

type PatternLimitWithPaletteLimits = {
  n: number
  palettesN: number[]
}

type PatternPaletteLimitsByLayerName = Record<string, PatternLimitWithPaletteLimits>

/**
 * A 32 byte hex string
 * @class DNA
 * @property {string} dna The DNA string
 * @throws {Error} if the provided DNA is not a valid 32 byte hexstring
 * @example const dna = new DNA("0000000000000000000000000000000000000000000000000000000000000000");
 * @dev The DNA string is a 32 byte hex string. The DNA string is immutable. The bytes represent
 * the following:
 *
 * ZZZZ YYYY XXXX WWWW VVVV UUUU TTTT SSSS
 * SSSS 0000 0000 0000 0000 0000 0000 0000
 *
 *    Bytes  |  Chars  | Description
 *  ---------|---------|-------------
 *   [0:1]   | [0:3]   |  body
 *   [2:3]   | [4:7]   |  tattoos
 *   [4:5]   | [8:11]  |  makeup
 *   [6:7]   | [12:15] |  left eye
 *   [8:9]   | [16:19] |  right eye
 *   [10:11] | [20:23] |  bottomwear
 *   [12:13] | [24:27] |  footwear
 *   [14:15] | [28:31] |  topwear
 *   [16:17] | [32:35] |  handwear
 *   [18:19] | [36:39] |  outerwear
 *   [20:21] | [40:43] |  jewelry
 *   [22:23] | [44:47] |  facial hair
 *   [24:25] | [48:51] |  facewear
 *   [26:27] | [52:55] |  eyewear
 *   [28:29] | [56:59] |  hair
 *   [30:31] | [60:63] |  reserved
 */
export class DNA {
  private readonly _dna: string
  private readonly _buffer: Buffer
  private readonly HEX_CODE_REGEX = /^[0-9A-Fa-f]{64}$/

  public static readonly ZERO = new DNA('0'.repeat(64))

  /**
   * Creates a DNA instance
   * @param dna The 32 byte hex string
   * @throws {Error} if the provided DNA is not a valid 32 byte hexstring
   */
  constructor(dna: DNALike) {
    if (dna === undefined) {
      throw new Error('DNA cannot be undefined')
    }
    if (dna instanceof DNA) {
      this._buffer = dna.buffer
      this._dna = dna.hex
    } else if (dna instanceof Buffer) {
      this._buffer = dna
      this._dna = this._buffer.toString('hex')
    } else if (typeof dna === 'string') {
      if (dna.startsWith('0x')) {
        dna = dna.slice(2)
      }
      if (!this.HEX_CODE_REGEX.test(dna)) {
        throw new Error(`Invalid DNA: ${dna}`)
      }
      this._dna = dna
      this._buffer = Buffer.from(this._dna, 'hex')
    } else {
      // dna is an object
      const prefixes = []
      for (const layer of AvatarLayerStack.iter()) {
        const patternPaletteIndex = dna[layer.name]
        if (patternPaletteIndex === undefined) {
          throw new Error(`Missing patternPaletteIndex for layer ${layer.name}`)
        }
        prefixes.push(hexify(patternPaletteIndex.pattern))
        prefixes.push(hexify(patternPaletteIndex.palette))
      }
      const prefix = prefixes.join('')
      this._dna = prefix + '0'.repeat(64 - prefix.length)
      this._buffer = Buffer.from(this._dna, 'hex')
    }
    // check length first for easier debugging
    if (this._dna.length !== 64) {
      throw new Error(`Invalid DNA length: ${this._dna.length} (${dna})`)
    }
    // check if the hexcode string is a valid 32 byte hexstring
    if (!this.HEX_CODE_REGEX.test(this._dna)) {
      throw new Error(`Invalid DNA regex: ${dna}`)
    }
  }

  /**
   * @returns The DNA as a Buffer
   */
  get buffer(): Buffer {
    return this._buffer
  }

  /**
   * @returns The DNA string
   */
  get hex(): string {
    return this._dna
  }

  /**
   * @returns The length of the DNA string
   */
  get length(): number {
    return this._dna.length
  }

  /**
   * @returns The DNA string
   * @override
   */
  toString(): `0x${string}` {
    return `0x${this._dna}`
  }

  /**
   * Returns the pattern/palette index for the given layer as represented by the DNA
   * @param nameOrIndex The name or index of the layer
   * @returns The pattern/palette index for the given layer as represented by the DNA
   */
  get(nameOrIndex: LayerDescriptor | string | number): PatternPaletteIndex {
    let layerName: string = ''
    // convert to name if number
    if (typeof nameOrIndex === 'number') {
      layerName = AvatarLayerStack.get(nameOrIndex).name
    }
    // should be a string now
    if (typeof nameOrIndex !== 'string') {
      // should be a LayerDescriptor so try to get the name
      layerName = (nameOrIndex as LayerDescriptor).name
    }
    // get by name
    if ([...AvatarLayerStack.iter()].map((layer) => layer.name).indexOf(layerName) === -1) {
      throw new Error(`Invalid layer name: ${layerName}`)
    }
    try {
      return {
        pattern: this._buffer.readUInt8(OFFSET.byte[layerName].pattern),
        palette: this._buffer.readUInt8(OFFSET.byte[layerName].palette),
      }
    } catch (e) {
      console.error('Unexpected error, possibly introduced a new layer without corresponding DNA getter')
      throw new Error(`Invalid layer name: ${nameOrIndex}`)
    }
  }

  /**
   * Returns whether the DNA is equal to another DNA
   * @param other The other DNA
   * @returns True if all bytes are equal
   */
  equals(other: DNA): boolean {
    return this._dna === other._dna
  }

  /**
   * Replace a DNA at a specific index
   * @param index The index to replace
   * @param replacement The replacement DNA
   * @returns A new DNA instance with the replacement
   * @throws {Error} if the resulting DNA after replacement is spliced in
   */
  private replaceAt(index: number, replacement: string): DNA {
    if (index === undefined || replacement === undefined) {
      throw new Error(`Invalid replacement index: ${index} (${replacement})`)
    }
    const endIndex = index + replacement.length
    if (endIndex > this._dna.length) {
      throw new Error(`Invalid replacement index: ${index} (${replacement})`)
    }
    const newDNA = this._dna.slice(0, index) + replacement + this._dna.slice(endIndex)
    return new DNA(newDNA)
  }

  replace(values: OptionalPatternPaletteIndexes): DNA {
    let dna: DNA = this
    for (const layer of AvatarLayerStack.iter()) {
      if (values[layer.name]?.pattern !== undefined) {
        dna = dna.replaceAt(
          OFFSET.char[layer.name].pattern,
          (values as any)[layer.name].pattern.toString(16).padStart(2, '0')
        )
      }
      if (values[layer.name]?.palette !== undefined) {
        dna = dna.replaceAt(
          OFFSET.char[layer.name].palette,
          (values as any)[layer.name].palette.toString(16).padStart(2, '0')
        )
      }
    }
    return dna
  }

  /**
   * Replace the given DNA with random values for the given properties
   * @param limits The random limits
   * @returns A new DNA instance with the replacement
   */
  private random(limits: PatternPaletteLimitsByLayerName): DNA {
    function rand(max: number): number {
      return Math.floor(Math.random() * max)
    }

    const replaceWith: OptionalPatternPaletteIndexes = {}
    for (const layer of AvatarLayerStack.iter()) {
      const layerLimits: PatternLimitWithPaletteLimits | undefined = limits[layer.name]
      if (layerLimits !== undefined) {
        // flatten them into one set of options so they are equally distributed even if uneven
        const opts: { pattern: number; palette: number }[] = []
        for (let i = 0; i < layerLimits.n; i++) {
          for (let j = 0; j < layerLimits.palettesN[i]; j++) {
            opts.push({ pattern: i, palette: j })
          }
        }
        // now compute the rand index into the opts array
        const r = rand(opts.length)
        replaceWith[layer.name] = opts[r]
      }
    }

    return this.replace(replaceWith)
  }

  and(other: DNA): DNA {
    const newBuffer = Buffer.alloc(this._buffer.length)
    for (let i = 0; i < this._buffer.length; i++) {
      newBuffer[i] = this._buffer[i] & other._buffer[i]
    }
    return new DNA(newBuffer)
  }

  or(other: DNA): DNA {
    const newBuffer = Buffer.alloc(this._buffer.length)
    for (let i = 0; i < this._buffer.length; i++) {
      newBuffer[i] = this._buffer[i] | other._buffer[i]
    }
    return new DNA(newBuffer)
  }

  static random(limits: PatternPaletteLimitsByLayerName): DNA {
    return DNA.ZERO.random(limits)
  }
}
