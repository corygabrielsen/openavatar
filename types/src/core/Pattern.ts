import { BidirectionalMap } from '../util/BidirectionalMap'
import { LayerDescriptor } from './Layer'

/**
 * {@link PatternDescriptor} represents an individual pattern in a layered
 * pixel art composition. It contains a name for identification and an index
 * for ordering purposes.
 */
export type PatternDescriptor = {
  layer: LayerDescriptor
  name: string
  index: number
}

/**
 * A type that can be used to reference a {@link PatternDescriptor}.
 */
export type PatternRef = number | string | PatternDescriptor

/**
 * {@link PatternDescriptorProvider} is an interface for objects that can
 * provide {@link PatternDescriptor} instances based on either their name or
 * index. This interface ensures that classes implementing it can retrieve
 * pattern information in a standardized manner.
 */
export interface PatternDescriptorProvider {
  get(layer: LayerDescriptor, ref: string | number): PatternDescriptor
  getBy(layer: LayerDescriptor): PatternDescriptor[]
  getAll(): PatternDescriptor[]
}

/**
 * Ensure that the given array of {@link PatternDescriptor} is not empty.
 * @param patterns The array of {@link PatternDescriptor} to check
 * @throws Error if the array is empty
 */
function nonEmpty(patterns: PatternDescriptor[]): void {
  if (patterns === undefined || patterns.length === 0) {
    throw new Error('PatternDescriptorCollection cannot be empty')
  }
}

/**
 * Ensure that there are no duplicate {@link PatternDescriptor} objects in the
 * given array.
 * @param patterns The array of {@link PatternDescriptor} to check
 * @throws Error if there are duplicate pattern names or indices within a
 * layer
 */
function noDuplicates(patterns: PatternDescriptor[]): void {
  // duplicate layer names/indices allowed if there are unique patterns within
  // each layer

  // ensure no duplicate pattern names within a layer
  const layerToPatternNames = new Map<string, Set<string>>()
  patterns.forEach((pattern) => {
    const layerPatterns = layerToPatternNames.get(pattern.layer.name) || new Set<string>()
    if (layerPatterns.has(pattern.name)) {
      throw new Error(`Duplicate pattern name within layer: ${pattern.name}`)
    }
    layerPatterns.add(pattern.name)
    layerToPatternNames.set(pattern.layer.name, layerPatterns)
  })
  // ensure no duplicate pattern indices within a layer
  const layerToPatternIndices = new Map<string, Set<number>>()
  patterns.forEach((pattern) => {
    const layerPatterns = layerToPatternIndices.get(pattern.layer.name) || new Set<number>()
    if (layerPatterns.has(pattern.index)) {
      throw new Error(`Duplicate pattern index within layer: ${pattern.index}`)
    }
    layerPatterns.add(pattern.index)
    layerToPatternIndices.set(pattern.layer.name, layerPatterns)
  })
}

/**
 * {@link PatternDescriptorCollection} is an abstract class that implements the
 * {@link PatternDescriptorProvider} interface. It provides a structure for
 * managing and interacting with a collection of {@link PatternDescriptor}
 * objects. This class enables easy retrieval, iteration, and manipulation of
 * {@link PatternDescriptor} in a collection-like manner, where patterns are
 * associated with layers and can be identified using names or indices.
 */
export abstract class PatternDescriptorCollection implements PatternDescriptorProvider {
  private readonly patterns: PatternDescriptor[] = []
  private readonly layerToPatternNameToIndexBidirectional: Map<string, BidirectionalMap<string, number>> = new Map()

  constructor(patterns: PatternDescriptor[]) {
    nonEmpty(patterns)
    noDuplicates(patterns)
    // deep copy then sort
    this.patterns = patterns.sort((a, b) => {
      if (a.layer.index === b.layer.index) {
        return a.index - b.index
      }
      return a.layer.index - b.layer.index
    })
    this.patterns.forEach((pattern) => {
      const layerPatterns =
        this.layerToPatternNameToIndexBidirectional.get(pattern.layer.name) || new BidirectionalMap<string, number>()
      layerPatterns.set(pattern.name, pattern.index)
      this.layerToPatternNameToIndexBidirectional.set(pattern.layer.name, layerPatterns)
    })
  }

  /**
   * Get the pattern for a given layer and pattern name or index
   * @param layer The layer descriptor
   * @param ref The pattern name or index
   * @returns The pattern
   */
  public get(layer: LayerDescriptor, ref: PatternRef): PatternDescriptor {
    let found: PatternDescriptor | undefined = undefined
    const layerPatterns: BidirectionalMap<string, number> | undefined = this.layerToPatternNameToIndexBidirectional.get(
      layer.name
    )
    if (layerPatterns === undefined) {
      throw new Error(`Unknown layer: ${JSON.stringify(layer)} (pattern=${ref})`)
    }

    if (typeof ref === 'string') {
      const name = ref
      const index: number | undefined = layerPatterns.getForward(name)
      if (index !== undefined) {
        found = {
          layer,
          name,
          index,
        }
      }
    } else if (typeof ref === 'number') {
      const index = ref
      const name = layerPatterns.getReverse(index)
      if (name !== undefined) {
        found = {
          layer,
          name,
          index,
        }
      }
    } else if (typeof ref === 'object') {
      const pattern = ref
      if (pattern.layer.name === layer.name) {
        found = pattern
      }
    }

    if (found === undefined) {
      throw new Error(`Invalid pattern reference for layer ${layer.name}: ${ref}.`)
    }
    return found
  }

  /**
   * Get all patterns for a given layer
   * @param layer The layer descriptor
   * @returns An array of patterns
   */
  public getBy(layer: LayerDescriptor): PatternDescriptor[] {
    return this.patterns.filter((pattern) => pattern.layer.name === layer.name)
  }

  /**
   * Get all patterns
   * @returns An array of patterns
   */
  public getAll(): PatternDescriptor[] {
    return this.patterns
  }

  /**
   * Get the number of patterns for a given layer
   * @param layer The layer descriptor
   * @returns The number of patterns
   */
  public getCount(layer: LayerDescriptor): number {
    return this.getBy(layer).length
  }

  /**
   * Returns an iterator for the patterns
   * @returns An iterator for the patterns
   */
  public iter(): IterableIterator<PatternDescriptor> {
    return this.patterns.values()
  }

  /**
   * Map the patterns
   * @param fn The mapping function
   * @returns An array of values where each value is the result of the mapping
   * function applied to the corresponding patterns
   */
  public map<T>(fn: (pattern: PatternDescriptor) => T): T[] {
    return [...this.iter()].map(fn)
  }

  /**
   * Filter the patterns
   * @param fn The filter function
   * @returns An array of patterns that pass the filter function
   */
  public filter(fn: (pattern: PatternDescriptor) => boolean): PatternDescriptor[] {
    return [...this.iter()].filter(fn)
  }

  /**
   * Reduce the patterns
   * @param fn The reduce function
   * @param initialValue The initial value
   * @returns The result of the reduce function
   */
  public reduce<T>(fn: (accumulator: T, pattern: PatternDescriptor) => T, initialValue: T): T {
    return [...this.iter()].reduce(fn, initialValue)
  }
}
