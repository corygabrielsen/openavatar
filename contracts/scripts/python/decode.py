#!/usr/bin/env python3
import zlib
from argparse import ArgumentParser, Namespace
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class IHDR:
    """
    Image Header.

    The IHDR chunk is the first chunk in a PNG file and contains important metadata about the image. The IHDR chunk has the following format:

    Bytes  Meaning
    4      IHDR chunk length (always 13)
    4      IHDR chunk type (always "IHDR")
    13     IHDR chunk data
    4      IHDR chunk crc

    The IHDR chunk data has the following format:
    4      Width of the image in pixels
    4      Height of the image in pixels
    1      Bit depth of the image (e.g. 8 bits per channel)
    1      Color type of the image (e.g. grayscale, RGB, etc.)
    1      Compression method used (always 0 for PNG files)
    1      Filter method used (always 0 for PNG files)
    1      Interlace method used (0 for non-interlaced, 1 for Adam7 interlacing)

    Only compression method 0 (deflate/inflate compression with a sliding window of at most 32768 bytes) is defined in
    this International Standard.

    Only filter method 0 (adaptive filtering with five basic filter types) is defined in this International Standard.
    """

    length: int
    ihdr: bytes
    # chunk data
    width: int
    height: int
    bit_depth: int
    color_type: int
    compression: int
    filtering: int
    interlace: int
    # checksum
    crc: bytes

    @staticmethod
    def parse(b: bytes) -> "IHDR":
        f = 18

        length_bytes, length = unpack_int(b[0:4])
        assert length == 13
        ihdr_ihdr = b[4:8]
        assert ihdr_ihdr == b"IHDR"

        # Bytes  Meaning
        # 4      Width of the image in pixels
        # 4      Height of the image in pixels
        # 1      Bit depth of the image (e.g. 8 bits per channel)
        # 1      Color type of the image (e.g. grayscale, RGB, etc.)
        # 1      Compression method used (always 0 for PNG files)
        # 1      Filter method used (always 0 for PNG files)
        # 1      Interlace method used (0 for non-interlaced, 1 for Adam7 interlacing)
        ihdr_chunk = b[8 : 8 + length]
        ihdr_width_bytes, ihdr_width = unpack_int(ihdr_chunk[0:4])
        ihdr_height_bytes, ihdr_height = unpack_int(ihdr_chunk[4:8])
        ihdr_bit_depth_bytes, ihdr_bit_depth = unpack_int(ihdr_chunk[8:9])
        ihdr_color_type_bytes, ihdr_color_type = unpack_int(ihdr_chunk[9:10])
        ihdr_compression_bytes, ihdr_compression = unpack_int(ihdr_chunk[10:11])
        ihdr_filtering_bytes, ihdr_filtering = unpack_int(ihdr_chunk[11:12])
        ihdr_interlace_bytes, ihdr_interlace = unpack_int(ihdr_chunk[12:13])

        # CRC checksum
        # The CRC checksum is a 4-byte value that is used to verify the integrity of the chunk.
        # The checksum is calculated by taking the CRC-32 of the chunk type field and the chunk data fields,
        # in that order (the CRC is not taken of the length field).
        # The CRC-32 is expressed as a 4-byte integer, most significant byte first.
        # The CRC-32 algorithm is described in RFC 1952.
        # The CRC-32 is always present, even for chunks containing no data.
        ihdr_crc = b[8 + length : 8 + length + 4]
        computed: int = zlib.crc32(ihdr_ihdr + ihdr_chunk)
        computed_bytes = computed.to_bytes(4, byteorder="big")
        assert ihdr_crc == computed_bytes, f"crc32 computed: {computed_bytes.hex(' ')} != {ihdr_crc.hex(' ')}"

        ihdr: IHDR = IHDR(
            length=length,
            ihdr=ihdr_ihdr,
            width=ihdr_width,
            height=ihdr_height,
            bit_depth=ihdr_bit_depth,
            color_type=ihdr_color_type,
            compression=ihdr_compression,
            filtering=ihdr_filtering,
            interlace=ihdr_interlace,
            crc=ihdr_crc,
        )

        return ihdr

    def print(self):
        f = 18
        print("IHDR")
        print("ihdr_length".ljust(f), self.length)
        print("ihdr_ihdr".ljust(f), self.ihdr.hex(" "))
        print("ihdr_width".ljust(f), self.width)
        print("ihdr_height".ljust(f), self.height)
        print("ihdr_bit_depth".ljust(f), self.bit_depth)
        print("ihdr_color_type".ljust(f), self.color_type)
        print("ihdr_compression".ljust(f), self.compression)
        print("ihdr_filtering".ljust(f), self.filtering)
        print("ihdr_interlace".ljust(f), self.interlace)
        print("ihdr_crc".ljust(f), self.crc.hex(" "))


@dataclass
class IDAT:
    """
    Image Data.

    The IDAT chunk contains the actual image data. The IDAT chunk consists of a sequence of bytes that represent the
    image data, along with some metadata about the image.

    The IDAT chunk has the following format:

    Bytes  Meaning
    4      IDAT chunk length
    4      IDAT chunk type (always "IDAT")
    n      IDAT chunk data (n bytes)
    4      IDAT chunk crc

    The IDAT chunk data is a sequence of bytes that represent the image data.

    The image data is a sequence of scanlines, each scanline being a sequence of bytes. The scanlines are ordered from
    top to bottom. The first scanline is the top scanline, and the last scanline is the bottom scanline. The number of
    scanlines is equal to the image height.

    The number of bytes in each scanline is equal to the image width plus 1. The first byte in each scanline is a filter
    type byte. The remaining bytes in each scanline are the image data for that scanline.

    The filter type byte is used to select a filter function that is applied to the scanline before compression. The
    filter type byte is followed by the image data for that scanline. The image data is compressed using the deflate
    compression method.

    https://www.w3.org/TR/2003/REC-PNG-20031110/#10Compression
    Deflate-compressed datastreams within PNG are stored in the "zlib" format, which has the structure:

    Bytes  Meaning
    1    zlib compression method/flags code
    1    Additional flags/check bits
    n    Compressed data blocks
    4    Check value

    For PNG compression method 0, the zlib compression method/flags code shall specify method code 8
    (deflate compression) and an LZ77 window size of not more than 32768 bytes.

    If the data to be compressed contain 16384 bytes or fewer, the PNG encoder may set the window size by rounding up
    to a power of 2 (256 minimum).
    """

    # chunk length = len(chunk_data)
    length: int
    idat: bytes
    # chunk data
    data: bytes
    # checksum
    crc: bytes

    # full chunk
    chunk: bytes

    @staticmethod
    def parse(b: bytes) -> "IDAT":
        f = 18

        length_bytes, length = unpack_int(b[0:4])
        idat_idat = b[4:8]
        assert idat_idat == b"IDAT"

        # chunk data
        idat_data = b[8 : 8 + length]

        # CRC checksum
        idat_crc = b[8 + length : 8 + length + 4]
        # computed: int = zlib.crc32(idat_idat + idat_data)
        # computed_bytes = computed.to_bytes(4, byteorder="big")
        # assert (
        #     idat_crc == computed_bytes
        # ), f"crc32 computed: {computed_bytes.hex(' ')} != {idat_crc.hex(' ')}"

        idat: IDAT = IDAT(length=length, idat=idat_idat, data=idat_data, crc=idat_crc, chunk=b)

        return idat

    def print(self):
        f = 18
        print("IDAT")
        print("idat_chunk".ljust(f), self.chunk.hex(" "))
        print("idat_length".ljust(f), self.length)
        print("idat_idat".ljust(f), self.idat.hex(" "))
        print("idat_data".ljust(f), self.data.hex(" "))
        print("idat_crc".ljust(f), self.crc.hex(" "))


@dataclass
class IEND:
    """
    Image Trailer.

    The IEND chunk marks the end of the PNG datastream. It contains no data. The IEND chunk has the following format:

    Bytes  Meaning
    4      IEND chunk length (always 0)
    4      IEND chunk type (always "IEND")
    4      IEND chunk crc

    https://www.w3.org/TR/2003/REC-PNG-20031110/#11IEND
    """

    length: int
    iend: bytes
    crc: bytes

    @staticmethod
    def parse(b: bytes) -> "IEND":
        f = 18

        length_bytes, length = unpack_int(b[0:4])
        iend_iend = b[4:8]
        assert iend_iend == b"IEND"

        # CRC checksum
        iend_crc = b[8:12]
        # computed: int = zlib.crc32(iend_iend)
        # computed_bytes = computed.to_bytes(4, byteorder="big")
        # assert (
        #     iend_crc == computed_bytes
        # ), f"crc32 computed: {computed_bytes.hex(' ')} != {iend_crc.hex(' ')}"

        iend: IEND = IEND(length=length, iend=iend_iend, crc=iend_crc)

        return iend

    def print(self):
        f = 18
        print("IEND")
        print("iend_length".ljust(f), self.length)
        print("iend_iend".ljust(f), self.iend.hex(" "))
        print("iend_crc".ljust(f), self.crc.hex(" "))


@dataclass
class DecodedPNG:
    raw_data: bytes
    header: bytes
    ihdr: IHDR
    idat: IDAT
    iend: IEND

    def print(self):
        f = 18
        # print each bytes as hex, with a space in between each byte
        print("header".ljust(f), self.header.hex(" "))

        self.ihdr.print()
        self.idat.print()
        self.iend.print()

        print("bytes".ljust(f), self.raw_data.hex(" "))


def unpack_int(b: bytes) -> Tuple[bytes, int]:
    return b, int.from_bytes(b, byteorder="big")


PNG_SIGNATURE: bytes = b"\x89PNG\r\n\x1a\n"


def decode_png(b: bytes) -> DecodedPNG:
    f = 18
    # parse PNG header
    header: bytes = b[:8]
    assert header == PNG_SIGNATURE, f"PNG signature: {header.hex(' ')} != {PNG_SIGNATURE.hex(' ')}"

    # parse IHDR chunk
    # to parse the IHDR chunk, we need to know the length of the chunk
    # which is the first 4 bytes of the chunk
    offset_ihdr_start = 8
    ihdr_length_bytes, ihdr_length = unpack_int(b[offset_ihdr_start : offset_ihdr_start + 4])
    offset_ihdr_end = offset_ihdr_start + 4 + 4 + ihdr_length + 4
    ihdr_bytes: bytes = b[offset_ihdr_start:offset_ihdr_end]
    ihdr: IHDR = IHDR.parse(ihdr_bytes)

    # parse IDAT chunk
    offset_idat_start = offset_ihdr_end
    idat_length_bytes, idat_length = unpack_int(b[offset_idat_start : offset_idat_start + 4])
    offset_idat_end = offset_idat_start + 4 + 4 + idat_length + 4
    idat_bytes: bytes = b[offset_idat_start:offset_idat_end]
    idat: IDAT = IDAT.parse(idat_bytes)

    # parse IEND chunk
    offset_iend_start = offset_idat_end
    iend_length_bytes, iend_length = unpack_int(b[offset_iend_start : offset_iend_start + 4])
    offset_iend_end = offset_iend_start + 12
    iend_bytes: bytes = b[offset_iend_start:offset_iend_end]
    iend: IEND = IEND.parse(iend_bytes)

    decoded: DecodedPNG = DecodedPNG(raw_data=b, header=header, ihdr=ihdr, idat=idat, iend=iend)

    return decoded


def decode_file(filename: str) -> DecodedPNG:
    with open(filename, "rb") as f:
        return decode_png(f.read())


def parse_args() -> Namespace:
    parser = ArgumentParser()
    # list of filenames to decode
    parser.add_argument("filenames", nargs="+")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    decoded = [decode_file(filename) for filename in args.filenames]
    for d in decoded:
        d.print()


if __name__ == "__main__":
    main()
