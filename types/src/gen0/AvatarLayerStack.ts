import { LayerDescriptor, LayerDescriptorStack } from '../core/Layer'

/**
 * AvatarLayerNames is an enumeration of the layer names for an avatar in OpenAvatar Gen 0.
 * It lists the names of each layer, which can be used as keys for accessing layer information.
 */
enum AvatarLayerNames {
  body = 'body',
  tattoos = 'tattoos',
  makeup = 'makeup',
  left_eye = 'left_eye',
  right_eye = 'right_eye',
  footwear = 'footwear',
  bottomwear = 'bottomwear',
  topwear = 'topwear',
  handwear = 'handwear',
  outerwear = 'outerwear',
  jewelry = 'jewelry',
  facial_hair = 'facial_hair',
  facewear = 'facewear',
  eyewear = 'eyewear',
  hair = 'hair',
}

/**
 * AvatarLayerStackSingleton is a singleton class that extends
 * {@link LayerDescriptorStack} to provide predefined layer definitions. It
 * contains methods to access individual layers, as well as the top and bottom
 * layers, based on the layer index.
 *
 * Layer indices are defined in steps of size 10, starting from 10. This allows
 * for new layers to be inserted in between existing layers.
 */
class AvatarLayerStackSingleton extends LayerDescriptorStack {
  private static _instance: AvatarLayerStackSingleton

  private constructor() {
    const layers: LayerDescriptor[] = []
    // start at 10
    const startLayerIndex = 10
    // increment by 10
    const layerIndexStepSize = 10
    // the spacing allows us to insert new layers in between existing layers
    function layerIndex(order: number): number {
      return startLayerIndex + order * layerIndexStepSize
    }
    let i = 0
    // the order of these layers is important

    // body
    layers.push({ name: AvatarLayerNames.body, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.tattoos, index: layerIndex(i++) })
    // makeup (covers skin)
    layers.push({ name: AvatarLayerNames.makeup, index: layerIndex(i++) })
    // eyes (covers skin, above facial hair)
    layers.push({ name: AvatarLayerNames.left_eye, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.right_eye, index: layerIndex(i++) })
    // clothing (covers body, makeup, facial hair, and eyes)
    layers.push({ name: AvatarLayerNames.bottomwear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.footwear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.topwear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.handwear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.outerwear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.jewelry, index: layerIndex(i++) })
    // facial hair (can dangle over the face, clothing, jewelry)
    layers.push({ name: AvatarLayerNames.facial_hair, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.facewear, index: layerIndex(i++) })
    layers.push({ name: AvatarLayerNames.eyewear, index: layerIndex(i++) })
    // hair (can dangle over clothing)
    layers.push({ name: AvatarLayerNames.hair, index: layerIndex(i++) })
    super(layers)
  }

  /**
   * Get the singleton instance of AvatarLayerStack
   * @returns The singleton instance of AvatarLayerStack
   */
  public static instance(): AvatarLayerStackSingleton {
    if (!AvatarLayerStackSingleton._instance) {
      AvatarLayerStackSingleton._instance = new AvatarLayerStackSingleton()
    }

    return AvatarLayerStackSingleton._instance
  }

  /**
   * Get the bottom layer as defined by the layer index
   * @returns The bottom layer
   */
  public static get bottomLayer(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().bottomLayer
  }

  /**
   * Get the top layer as defined by the layer index
   * @returns The top layer
   */
  public static get topLayer(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().topLayer
  }

  /////////////////////////////////////////////////////////////////////////////
  // OpenAvatar Gen 0 layer descriptors
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the body layer
   * @returns The body layer
   */
  get body(): LayerDescriptor {
    return this.get(AvatarLayerNames.body)
  }

  /**
   * Get the bottomwear layer
   * @returns The bottomwear layer
   */
  get bottomwear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.bottomwear)
  }

  /**
   * Get the eyewear layer
   * @returns The eyewear layer
   */
  get eyewear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.eyewear)
  }

  /**
   * Get the facewear layer
   * @returns The facewear layer
   */
  get facewear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.facewear)
  }

  /**
   * Get the facial hair layer
   * @returns The facial hair layer
   */
  get facial_hair(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.facial_hair)
  }

  /**
   * Get the footwear layer
   * @returns The footwear layer
   */
  get footwear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.footwear)
  }

  /**
   * Get the hair layer
   * @returns The hair layer
   */
  get hair(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.hair)
  }

  /**
   * Get the handwear layer
   * @returns The handwear layer
   */
  get handwear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.handwear)
  }

  /**
   * Get the jewelry layer
   * @returns The jewelry layer
   */
  get jewelry(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.jewelry)
  }

  /**
   * Get the left eye layer
   * @returns The left eye layer
   */
  get left_eye(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.left_eye)
  }

  /**
   * Get the makeup layer
   * @returns The makeup layer
   */
  get makeup(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.makeup)
  }

  /**
   * Get the outerwear layer
   * @returns The outerwear layer
   */
  get outerwear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.outerwear)
  }

  /**
   * Get the right eye layer
   * @returns The right eye layer
   */
  get right_eye(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.right_eye)
  }

  /**
   * Get the tattoos layer
   * @returns The tattoos layer
   */
  get tattoos(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.tattoos)
  }

  /**
   * Get the topwear layer
   * @returns The topwear layer
   */
  get topwear(): LayerDescriptor {
    return AvatarLayerStackSingleton.instance().get(AvatarLayerNames.topwear)
  }
}

/**
 * AvatarLayerStack is an exported constant that contains an instance of the
 * {@link AvatarLayerStackSingleton}. It provides access to the layer descriptors.
 */
export const AvatarLayerStack = AvatarLayerStackSingleton.instance()
