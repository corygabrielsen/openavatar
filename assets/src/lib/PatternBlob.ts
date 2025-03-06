import { PatternHeader } from './PatternHeader'

export type PatternBlob = {
  header: PatternHeader
  data: Buffer | Uint8Array
}
