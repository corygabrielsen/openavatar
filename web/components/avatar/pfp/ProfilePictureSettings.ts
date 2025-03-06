export interface ProfilePictureSettings {
  overrideBackground: boolean
  backgroundColor: `#${string}`
  maskBelowTheNeck: boolean
}

export const DEFAULT_PFP_SETTINGS: ProfilePictureSettings = {
  overrideBackground: false,
  backgroundColor: '#000000',
  maskBelowTheNeck: false,
}
