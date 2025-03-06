export type RGBA = {
  r: number
  g: number
  b: number
  a: number
}

export class PixelBlender {
  /**
   * @notice Blend two pixels together.
   * @param foreground The foreground pixel color value.
   * @param background The background pixel color value.
   * @param foregroundAlpha The alpha of the foreground pixel.
   * @return The blended pixel color value.
   */
  static blendPixel(foreground: number, background: number, foregroundAlpha: number): number {
    return Math.floor((foreground * foregroundAlpha + background * (255 - foregroundAlpha)) / 255)
  }

  /**
   * @notice Blend two alpha values together.
   * @param foregroundAlpha The foreground alpha value.
   * @param backgroundAlpha The background alpha value.
   * @return The blended alpha value.
   */
  static blendAlpha(foregroundAlpha: number, backgroundAlpha: number): number {
    if (foregroundAlpha === 255) return 255
    if (backgroundAlpha === 255) return 255
    return Math.floor(foregroundAlpha + (backgroundAlpha * (255 - foregroundAlpha)) / 255)
  }

  /**
   * @notice Blend two pixels together.
   * @param base The base pixel color value.
   * @param overlay The overlay pixel color value.
   * @return The blended pixel color value.
   */
  static blend(base: RGBA, overlay: RGBA): RGBA {
    // If both colors are fully transparent, return transparent black
    if (base.a === 0 && overlay.a === 0) {
      return { r: 0, g: 0, b: 0, a: 0 }
    }

    // If one color is fully transparent, return the other color
    if (base.a === 0) return overlay
    if (overlay.a === 0) return base

    // If both colors are fully opaque or one is semi-transparent, perform standard blending
    const rOut = PixelBlender.blendPixel(overlay.r, base.r, overlay.a)
    const gOut = PixelBlender.blendPixel(overlay.g, base.g, overlay.a)
    const bOut = PixelBlender.blendPixel(overlay.b, base.b, overlay.a)
    const aOut = PixelBlender.blendAlpha(overlay.a, base.a)

    return {
      r: Math.round(rOut),
      g: Math.round(gOut),
      b: Math.round(bOut),
      a: Math.round(aOut),
    }
  }
}
