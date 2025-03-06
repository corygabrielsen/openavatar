import { AvatarLayerStack, LayerDescriptor } from '@openavatar/types'

export enum AvatarMakerCategory {
  BODY = 'body',
  TATTOOS = 'tattoos',
  EYES = 'eyes',
  HAIR = 'hair',
  FACIAL_HAIR = 'facial_hair',
  MAKEUP = 'makeup',
  JEWELRY = 'jewelry',
  EYEWEAR = 'eyewear',
  // FACEWEAR = 'facewear',
  CLOTHES = 'clothes',
}

export const AvatarMakerCategories: Record<AvatarMakerCategory, LayerDescriptor[]> = {
  [AvatarMakerCategory.BODY]: [AvatarLayerStack.body],
  [AvatarMakerCategory.TATTOOS]: [AvatarLayerStack.tattoos],
  [AvatarMakerCategory.EYES]: [AvatarLayerStack.left_eye, AvatarLayerStack.right_eye],
  [AvatarMakerCategory.FACIAL_HAIR]: [AvatarLayerStack.facial_hair],
  [AvatarMakerCategory.HAIR]: [AvatarLayerStack.hair],
  [AvatarMakerCategory.MAKEUP]: [AvatarLayerStack.makeup],
  [AvatarMakerCategory.JEWELRY]: [AvatarLayerStack.jewelry],
  // [AvatarMakerCategory.FACEWEAR]: [AvatarLayerStack.facewear],
  [AvatarMakerCategory.EYEWEAR]: [AvatarLayerStack.eyewear],
  [AvatarMakerCategory.CLOTHES]: [
    AvatarLayerStack.bottomwear,
    AvatarLayerStack.footwear,
    AvatarLayerStack.topwear,
    AvatarLayerStack.handwear,
    AvatarLayerStack.outerwear,
  ],
}
