#!/usr/bin/env python3
from dataclasses import dataclass
from heapq import heapify, heappop, heappush
from typing import Any, Dict, List, Optional


@dataclass
class Node:
    symbol: Optional[Any] = None
    weight: int = 0
    left: Optional["Node"] = None
    right: Optional["Node"] = None

    def __lt__(self, other: "Node") -> bool:
        return self.weight < other.weight


def build_tree(data: List[Any]) -> Node:
    """
    Build a Huffman tree from the given data.

    Parameters:
    - data: a list of elements to build the tree from. The elements can be of any type.
    - returns: the root node of the resulting Huffman tree.

    The tree is constructed by building a frequency table for the input data, constructing
    a list of Node objects from the frequency table, and then merging the nodes in the list
    until only the root node remains. The resulting tree represents a prefix coding of the
    input data, with the more frequently occurring elements having shorter codes.
    """
    # Build frequency table
    freq: Dict[Any, int] = {}
    for ch in data:
        if ch in freq:
            freq[ch] += 1
        else:
            freq[ch] = 1

    # Build priority queue of nodes
    pq: List[Node] = []
    for ch, count in freq.items():
        pq.append(Node(symbol=ch, weight=count))
    heapify(pq)

    # Merge nodes until only the root node remains
    while len(pq) > 1:
        left = heappop(pq)
        right = heappop(pq)
        node = Node(weight=left.weight + right.weight, left=left, right=right)
        heappush(pq, node)

    return pq[0]


def build_encoding_table(node: Optional[Node], prefix: str = "", enc: Dict[Any, str] = {}) -> Dict[Any, str]:
    """
    Build an encoding table for the given Huffman tree.

    Parameters:
    - node: the root node of the Huffman tree.
    - prefix: the current prefix string representing the path through the tree.
    - enc: the encoding table being built, with the keys being the symbols in the original data
        and the values being the corresponding Huffman codes.
    - returns: the completed encoding table.

    The encoding table is constructed by recursively traversing the tree, starting at the given
    node. If the current node is a leaf node (that is, it has no children), then it is added to
    the encoding table with the corresponding prefix as its value. Otherwise, the function is
    called recursively on the left and right children of the current node, with the prefix
    argument being updated to reflect the path taken through the tree. This continues until all
    nodes in the tree have been processed and the encoding table is complete.
    """
    if node is None:
        return
    if node.symbol is not None:
        enc[node.symbol] = prefix
    build_encoding_table(node.left, prefix + "0", enc)
    build_encoding_table(node.right, prefix + "1", enc)
    return enc


def huffman_encode(data: List[Any]) -> Dict[Any, str]:
    """
    Encode the given data using a Huffman tree.

    Parameters:
    - data: a list of elements to encode. The elements can be of any type.
    - returns: a dictionary with the keys being the symbols in the original data and the values
        being the corresponding Huffman codes.

    The encoding process consists of building a Huffman tree from the input data, and then
    constructing an encoding table from the tree. The resulting encoding table represents a
    prefix coding of the input data, with the more frequently occurring elements having shorter
    codes.
    """
    tree: Node = build_tree(data)
    enc: Dict[Any, str] = build_encoding_table(tree)
    return enc


def main():
    data = list("Hello, World!")
    encoding = huffman_encode(data)
    print(f"Original data: {data}")
    print(f"Encoding table: {encoding}")


if __name__ == "__main__":
    main()
