/**
 * Adler-32 checksum algorithm
 */
export class Adler32 {
  /**
   * Calculate the Adler-32 checksum of a byte array, from offset to end
   * @param data The byte array to calculate the checksum of
   * @param offset The offset to start calculating the checksum from
   * @param end The offset to stop calculating the checksum at
   * @returns The Adler-32 checksum
   */
  public static adler32(data: Uint8Array, offset: number, end: number): number {
    let a: number = 1
    let b: number = 0

    // Process each byte of the data in order
    for (let i = offset; i < end; i++) {
      a = (a + data[i]) % 65521
      b = (b + a) % 65521
    }

    // The Adler-32 checksum is stored as a 4-byte value
    return (b << 16) | a
  }
}
