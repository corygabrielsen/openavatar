from typing import List, Tuple

RGBA = Tuple[int, int, int, int]


def checkerboard(h: int, w: int) -> List[List[RGBA]]:
    """
    Generate a checkerboard pattern

    :param h: height of the pattern
    :param w: width of the pattern
    :return: a list of lists of tuples of ints
    """
    data = []

    for a in range(h):
        row = []
        for b in range(w):
            val = a * w + b
            val = val * 16 + val
            val = val % 256
            row.append((val, val, val, 255))
        data.append(row)
    return data


def transparent_rainbow(h: int, w: int) -> List[List[RGBA]]:
    """
    Generate a transparent rainbow pattern
    """
    data = []

    for a in range(h):
        row = []
        for b in range(w):
            r = ~(a & b) & 0xFF
            g = (a | ~b) & 0xFF
            b = (~a & b) & 0xFF
            c = (a ^ b) & 0xFF
            row.append((r, g, b, c))

        data.append(row)
    return data


def flatten(data: List[List[RGBA]]) -> List[RGBA]:
    """
    Flatten a 2D list of tuples of ints into a 1D list of ints
    """
    flat = []
    for row in data:
        for col in row:
            flat.extend(col)
    return flat


def flatten_with_row_prefix(data: List[List[RGBA]], prefix: int) -> List[int]:
    """
    Flatten a 2D list of tuples of ints into a 1D list of ints with a prefix
    """
    flat = []
    for row in data:
        flat.append(prefix)
        for col in row:
            flat.extend(col)
    return flat
