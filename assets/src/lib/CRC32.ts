/**
 * CRC32 checksum algorithm
 */
export class CRC32 {
  /**
   * Calculate the CRC32 checksum of a byte array, from start to end
   * @param data The byte array to calculate the checksum of
   * @param start The start index of the data
   * @param end The end index of the data
   * @returns The CRC32 checksum
   */
  public static crc32(data: DataView, start: number, end: number): number {
    // Initialize the checksum to 0xffffffff
    let checksum: number = 0xffffffff

    // Loop through each byte of the chunk data
    for (let i = start; i < end; i++) {
      // XOR the byte with the checksum
      checksum = checksum ^ data.getUint8(i)
      // Loop through each bit of the byte
      for (let j = 0; j < 8; j++) {
        // If the LSB of the checksum is 1
        if ((checksum & 1) === 1) {
          // 0xEDB88320 is the CRC-32 polynomial in reversed bit order
          // this translates to the polynomial with equation
          // x^32 + x^26 + x^23 + x^22 + x^16 + x^12 + x^11 + x^10 + x^8 + x^7 + x^5 + x^4 + x^2 + x + 1
          // which is the same as the one used in the PNG specification
          checksum = (checksum >>> 1) ^ 0xedb88320
        }
        // If the LSB of the checksum is 0
        else {
          // Shift the checksum right by 1 bit
          checksum = checksum >>> 1
        }
      }
    }

    // Return the inverted checksum
    return ~checksum >>> 0
  }
}
