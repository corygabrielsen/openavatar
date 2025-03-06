/**
 * BidirectionalMap is a data structure that allows for bidirectional mapping
 * between keys and values. This class provides methods to perform operations
 * in both forward and reverse directions, making it convenient for use cases
 * where a two-way relationship between keys and values is needed.
 */
export class BidirectionalMap<K, V> {
  // A map to store the forward mapping from keys to values
  private forwardMap: Map<K, V>
  // A map to store the reverse mapping from values to keys
  private reverseMap: Map<V, K>

  /**
   * Initializes the BidirectionalMap with empty forward and reverse maps
   */
  constructor() {
    this.forwardMap = new Map<K, V>()
    this.reverseMap = new Map<V, K>()
  }

  /**
   * Returns the size of the bidirectional map, which is the same as the size
   * of the forward map.
   * @returns The size of the bidirectional map
   */
  public get size(): number {
    return this.forwardMap.size
  }

  /**
   * Sets a key-value pair in the bidirectional map by updating both the
   * forward and reverse maps.
   * @param key The key to be added
   * @param value The value to be associated with the key
   */
  public set(key: K, value: V): void {
    this.forwardMap.set(key, value)
    this.reverseMap.set(value, key)
  }

  /**
   * Checks if the bidirectional map contains a specific key in the forward map
   * @param key The key to check for
   * @returns A boolean indicating whether the key exists
   */
  public hasForward(key: K): boolean {
    return this.forwardMap.has(key)
  }

  /**
   * Checks if the bidirectional map contains a specific value in the reverse map
   * @param value The value to check for
   * @returns A boolean indicating whether the value exists
   */
  public hasReverse(value: V): boolean {
    return this.reverseMap.has(value)
  }

  /**
   * Retrieves the value associated with a specific key from the forward map
   * @param key The key to look up
   * @returns The associated value, or undefined if the key is not present
   */
  public getForward(key: K): V | undefined {
    return this.forwardMap.get(key)
  }

  /**
   * Retrieves the key associated with a specific value from the reverse map
   * @param value The value to look up
   * @returns The associated key, or undefined if the value is not present
   */
  public getReverse(value: V): K | undefined {
    return this.reverseMap.get(value)
  }
  /**
   * Deletes a key-value pair from the bidirectional map by removing the key and
   * its associated value from both the forward and reverse maps.
   * @param key The key to be removed
   * @returns A boolean indicating whether the key-value pair was successfully removed
   */
  public delete(key: K): boolean {
    const value = this.forwardMap.get(key)
    if (value === undefined) {
      return false
    }
    this.forwardMap.delete(key)
    this.reverseMap.delete(value)
    return true
  }

  /**
   * Removes all key-value pairs from the bidirectional map by clearing both
   * the forward and reverse maps.
   */
  public clear(): void {
    this.forwardMap.clear()
    this.reverseMap.clear()
  }

  /**
   * Returns an iterator for the key-value pairs in the bidirectional map.
   * @returns An iterator for the key-value pairs
   */
  public *entries(): IterableIterator<[K, V]> {
    yield* this.forwardMap.entries()
  }

  /**
   * Returns an iterator for the keys in the bidirectional map.
   * @returns An iterator for the keys
   */
  public *keys(): IterableIterator<K> {
    yield* this.forwardMap.keys()
  }

  /**
   * Returns an iterator for the values in the bidirectional map.
   * @returns An iterator for the values
   */
  public *values(): IterableIterator<V> {
    yield* this.forwardMap.values()
  }
}
