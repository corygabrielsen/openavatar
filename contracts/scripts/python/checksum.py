def adler32(data: bytes) -> bytes:
    """
    Calculates the Adler-32 checksum of the input data.

    :param data: The input data to calculate the checksum for.
    :return: The Adler-32 checksum as a 4-byte value.
    """
    a: int = 1
    b: int = 0

    # The magic number 65521 is the largest prime smaller than 2^16
    # It is used as the modulus for the checksum calculation
    # This is done to avoid overflows and to keep the checksum value small

    # Process each byte of the data in order
    for i in range(len(data)):
        a = (a + data[i]) % 65521
        b = (b + a) % 65521

    # The Adler-32 checksum is stored as a 4-byte value
    return (b << 16 | a).to_bytes(4, byteorder="big", signed=False)


def crc32(chunkData: bytes) -> int:
    """
    Calculates the CRC-32 checksum of the input data.

    :param chunkData: The input data to calculate the checksum for.
    :return: The CRC-32 checksum as a 4-byte value.
    """
    # Initialize the checksum to 0xffffffff
    checksum = 0xFFFFFFFF

    # Loop through each byte of the chunk data
    for i in range(len(chunkData)):
        # XOR the checksum with the current byte
        checksum ^= chunkData[i]

        # Loop through each bit of the current byte
        for j in range(8):
            # If the LSB of the checksum is 1, shift it right and XOR it with the polynomial
            if checksum & 1:
                # 0xEDB88320 is the CRC-32 polynomial in reversed bit order
                # this translates to the polynomial with equation
                # x^32 + x^26 + x^23 + x^22 + x^16 + x^12 + x^11 + x^10 + x^8 + x^7 + x^5 + x^4 + x^2 + x + 1
                # which is the same as the one used in the PNG specification
                checksum = (checksum >> 1) ^ 0xEDB88320
            # Otherwise, just shift it right
            else:
                checksum >>= 1

    # Return the checksum with the bytes reversed
    return checksum ^ 0xFFFFFFFF
