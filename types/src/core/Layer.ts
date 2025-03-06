import { BidirectionalMap } from '../util/BidirectionalMap'

/**
 * {@link LayerDescriptor} represents an individual layer in a layered pixel
 * art composition. It contains a name for identification and an index for
 * ordering purposes.
 */
export interface LayerDescriptor {
  name: string
  index: number
}

/**
 * {@link LayerDescriptorProvider} is an interface for objects that can provide
 * {@link LayerDescriptor} instances based on either their name or index. This
 * interface ensures that classes implementing it can retrieve layer
 * information in a standardized manner.
 */
export interface LayerDescriptorProvider {
  get(ref: string | number): LayerDescriptor
}

/**
 * Ensure that the given array of {@link LayerDescriptor} is not empty.
 * @param layers The array of {@link LayerDescriptor} to check
 * @throws Error if the array is empty
 */
function nonEmpty(layers: LayerDescriptor[]): void {
  if (layers === undefined || layers.length === 0) {
    throw new Error('LayerDescriptorStack cannot be empty')
  }
}

/**
 * Ensure that there are no duplicate layer indices or names in the given array
 * of {@link LayerDescriptor}.
 * @param layers The array of {@link LayerDescriptor} to check
 * @throws Error if there are duplicate layer indices or names
 */
function noDuplicates(layers: LayerDescriptor[]): void {
  // ensure no duplicate layer indices
  const layerIndices = new Set<number>()
  layers.forEach((layer) => {
    if (layerIndices.has(layer.index)) {
      throw new Error(`Duplicate layer index: ${layer.index}. Known layers: ${JSON.stringify(layers)}`)
    }
    layerIndices.add(layer.index)
  })
  // ensure no duplicate layer names
  const layerNames = new Set<string>()
  layers.forEach((layer) => {
    if (layerNames.has(layer.name)) {
      throw new Error(`Duplicate layer name: ${layer.name}`)
    }
    layerNames.add(layer.name)
  })
}

/**
 * Sort the given array of {@link LayerDescriptor} by their indices.
 * @param layers The array of {@link LayerDescriptor} to sort
 * @returns The sorted array of {@link LayerDescriptor}
 */
function sort(layers: LayerDescriptor[]): LayerDescriptor[] {
  return layers.sort((a, b) => a.index - b.index)
}

/**
 * {@link LayerDescriptorStack} is an abstract class that implements the
 * {@link LayerDescriptorProvider} interface. It provides a structure for
 * managing and interacting with a collection of {@link LayerDescriptor}
 * objects. This class enables easy retrieval, iteration, and manipulation of
 * {@link LayerDescriptor} in a stack-like manner, where layers are ordered and
 * can overlay one another based on their indices.
 */
export abstract class LayerDescriptorStack implements LayerDescriptorProvider {
  private readonly layers: LayerDescriptor[] = []
  private readonly layerNameToIndexBidirectional: BidirectionalMap<string, number> = new BidirectionalMap()

  protected constructor(layers: LayerDescriptor[]) {
    nonEmpty(layers)
    noDuplicates(layers)
    // deep copy then sort
    layers = sort(layers)
    this.layers = layers
    this.layers.forEach((layer) => {
      this.layerNameToIndexBidirectional.set(layer.name, layer.index)
    })
  }

  /**
   * Get the layer for a given layer name or index
   * @param ref The layer name or index
   * @returns The layer
   */
  public get(ref: string | number): LayerDescriptor {
    let found: LayerDescriptor | undefined = undefined
    if (typeof ref === 'string') {
      const name = ref
      const index: number | undefined = this.layerNameToIndexBidirectional.getForward(name)
      if (index !== undefined) {
        found = {
          name,
          index,
        }
      }
    } else {
      const index = ref
      const name = this.layerNameToIndexBidirectional.getReverse(index)
      if (name !== undefined) {
        found = {
          name,
          index,
        }
      }
    }
    if (found === undefined) {
      throw new Error(`Invalid layer reference: ${ref}. Known layers: ${JSON.stringify(this.layers)}`)
    }
    return found
  }

  /**
   * Returns an iterator for the layers
   * @returns An iterator for the layers
   */
  public iter(): IterableIterator<LayerDescriptor> {
    return this.layers.values()
  }

  /**
   * Map the layers
   * @param fn The mapping function
   * @returns An array of values where each value is the result of the mapping
   * function applied to the corresponding layer
   */
  public map<T>(fn: (layer: LayerDescriptor) => T): T[] {
    return [...this.iter()].map(fn)
  }

  /**
   * Filter the layers
   * @param fn The filter function
   * @returns An array of layers that pass the filter function
   */
  public filter(fn: (layer: LayerDescriptor) => boolean): LayerDescriptor[] {
    return [...this.iter()].filter(fn)
  }

  /**
   * Reduce the layers
   * @param fn The reduce function
   * @param initialValue The initial value
   * @returns The result of the reduce function
   */
  public reduce<T>(fn: (accumulator: T, layer: LayerDescriptor) => T, initialValue: T): T {
    return [...this.iter()].reduce(fn, initialValue)
  }

  /**
   * Get the bottom layer as defined by the layer index
   * @returns The bottom layer
   */
  get bottomLayer(): LayerDescriptor {
    return this.get(Math.min(...[...this.iter()].map((layer) => layer.index)))
  }

  /**
   * Get the top layer as defined by the layer index
   * @returns The top layer
   */
  get topLayer(): LayerDescriptor {
    return this.get(Math.max(...[...this.iter()].map((layer) => layer.index)))
  }
}
