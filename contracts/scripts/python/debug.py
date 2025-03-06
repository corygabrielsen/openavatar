#!/usr/bin/env python3

"""
This is a debug script for debugging a hand-written implementation of the DEFLATE algorithm as used in PNG files.
"""

from typing import Any, Dict, List

from checksum import adler32, crc32
from decode import DecodedPNG, decode_png
from huffman import huffman_encode
from image_data import RGBA, checkerboard, flatten, flatten_with_row_prefix, transparent_rainbow
from png import PNG

F = 24


def log(s: str, data: bytes):
    print(f"{s.ljust(F)}{data.hex(' ')}")


def main() -> None:
    """
    Main entry point for the script
    """
    h: int = 2
    w: int = 2
    alpha = True
    bit_depth = 8
    compression_level = 1
    filter_type = 0
    png: PNG = PNG(
        width=w,
        height=h,
        alpha=alpha,
        bit_depth=bit_depth,
        compression_level=compression_level,
        filter_type=filter_type,
    )

    rgba_grid: List[List[RGBA]] = checkerboard(h=h, w=w)
    rgba_flat: List[RGBA] = flatten(data=rgba_grid)
    png_bytes: bytes = png.bytes(rgba_grid)
    input_data: bytes = bytes(rgba_flat)
    filtered_input_data: bytes = bytes(flatten_with_row_prefix(data=rgba_grid, prefix=0))
    log("input_data", input_data)
    log("filtered_input_data", filtered_input_data)

    decoded_png: DecodedPNG = decode_png(png_bytes)
    log("decoded_png.idat.data", decoded_png.idat.data)

    #  DEFLATE Compressed Data Format
    #  https://www.ietf.org/rfc/rfc1951.txt
    #
    #  The DEFLATE compressed data format consists of a sequence of
    #  blocks.  Each block consists of a three-bit header followed by
    #  zero or more bytes of compressed data.  The header is followed by
    #  the compressed data for that block.  There is no requirement that
    #  blocks be a certain size, but the most common block size is 32K
    #  bytes.  The last block in a DEFLATE stream is followed by an end
    #  code, which is a special code that indicates the end of the
    #  stream.  The end code is not followed by any compressed data.

    #  Each block of compressed data begins with 3 header bits
    #     containing the following data:
    #
    #        first bit       BFINAL
    #        next 2 bits     BTYPE
    #
    #  The BFINAL bit indicates whether this is the last block in the
    #  stream.  If BFINAL is set, this is the last block.  If BFINAL is
    #  not set, there are more blocks to follow.

    #  The BTYPE field indicates the type of compression used in the
    #  block.  There are three types of compression:
    #
    #     00 - no compression
    #     01 - compressed with fixed Huffman codes
    #     10 - compressed with dynamic Huffman codes
    #     11 - reserved (error)
    #
    # here BFINAL = 1 and BTYPE = 00
    #
    # Non-compressed blocks (BTYPE=00)
    #
    #  Any bits of input up to the next byte boundary are ignored.
    #  The rest of the block consists of the following information:
    #
    #       0   1   2   3   4...
    #     +---+---+---+---+================================+
    #     |  LEN  | NLEN  |... LEN bytes of literal data...|
    #     +---+---+---+---+================================+
    #
    #  LEN is the number of data bytes in the block.  NLEN is the
    #  one's complement of LEN.
    #     # Create DEFLATE data
    # deflate_data = bytearray()
    # for block in blocks:
    #     deflate_data.append(len(block) & 0xff)
    #     deflate_data.append((len(block) >> 8) & 0xff)
    #     deflate_data.append(~len(block) & 0xff)
    #     deflate_data.append((~len(block) >> 8) & 0xff)
    #     deflate_data.extend(block)
    # return deflate_data

    block_data: bytes = filtered_input_data
    checksum: bytes = adler32(block_data)
    # BFINAL = 1
    # BTYPE = 00
    block_header: int = 0b00000001
    # block LEN and NLEN
    block_len_nlen = bytearray()
    l = len(block_data)
    block_len_nlen.append(l & 0xFF)
    block_len_nlen.append((l >> 8) & 0xFF)
    block_len_nlen.append(~l & 0xFF)
    block_len_nlen.append((~l >> 8) & 0xFF)

    log("block_len_nlen", block_len_nlen)

    block = bytearray()
    block.append(block_header)
    block.extend(block_len_nlen)
    block.extend(block_data)
    log("block", block)

    idat = bytearray()
    idat.extend(b"\x78\x01")
    idat.extend(block)
    idat.extend(checksum)
    log("idat", idat)
    log("decoded_png.idat.data", decoded_png.idat.data)

    idat_chunk_length = len(idat)
    idat_chunk_type = b"IDAT"
    idat_typedata = idat_chunk_type + idat
    idat_chunk_crc = crc32(idat_typedata)
    idat_chunk = bytearray()
    idat_chunk.extend(idat_chunk_length.to_bytes(4, byteorder="big"))
    idat_chunk.extend(idat_chunk_type)
    idat_chunk.extend(idat)
    idat_chunk.extend(idat_chunk_crc.to_bytes(4, byteorder="big"))
    log("idat_chunk", idat_chunk)
    log("decoded_png.idat.chunk", decoded_png.idat.chunk)

    print("\nhuffman encoding:")
    encoding_table: Dict[Any, str] = huffman_encode(list(filtered_input_data))
    for k, v in sorted(encoding_table.items()):
        print(f"{' ' * F}0x{'{:02x}'.format(k)} :  {v}")

    # encode the data using the encoding table
    encoded_data: str = ""
    for b in input_data:
        # appends the corresponding Huffman code from the encoding table
        encoded_data += encoding_table[b]

    # 101010100111011011001100000000111111111101
    print("encoded_data".ljust(F) + encoded_data)

    # interpret as bit sequence and convert to bytes
    encoded_data_bytes = bytes(int(encoded_data[i : i + 8], 2) for i in range(0, len(encoded_data), 8))
    log("encoded_data_bytes", encoded_data_bytes)


if __name__ == "__main__":
    main()

    # PNG
    # https://www.w3.org/TR/png/#Introduction

    # zlib
    # https://www.rfc-editor.org/rfc/rfc1950

    # DEFLATE
    # https://www.ietf.org/rfc/rfc1951.txt
