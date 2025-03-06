import { Avatar, PatternPaletteNames } from '@openavatar/types'
import { UI_GROUPS } from '../groups'
import AvatarTransformsPickerSection from './AvatarTransformsPickerSection'
import { UIGridLayoutType } from './grid'

interface UIAvatarTransform {
  label?: string
  transform: Record<string, PatternPaletteNames>
}

type Section = 'left_eye' | 'right_eye' | 'both_eyes'

interface Props {
  avatar: Avatar
  section: Section
  onClickAvatar: (avatar: Avatar) => void

  transforms: UIAvatarTransform[]
}

function paletteName(section: Section, transform: UIAvatarTransform): string {
  if (section === 'both_eyes') {
    return transform.transform.left_eye.paletteName
  }
  return transform.transform[section].paletteName
}

const AvatarEyesPickerSection = ({ avatar, transforms, onClickAvatar }: Props) => {
  const eyePaletteGroups = UI_GROUPS.both_eyes.paletteGroups || []

  // Initialize the categorizedTransforms based on groupConfig
  const categorizedTransforms: Record<string, UIAvatarTransform[]> = {}

  eyePaletteGroups.forEach((group) => {
    categorizedTransforms[group.name] = transforms.filter((transform) => {
      return group.regex.test(paletteName('both_eyes', transform))
    })
  })

  // Find all categorized transforms
  const allCategorizedTransforms: UIAvatarTransform[] = ([] as UIAvatarTransform[]).concat(
    ...Object.values(categorizedTransforms)
  )

  // Find remaining transforms that do not fit into any category
  // Should be none left
  const themes = transforms.filter(
    (transform) =>
      !allCategorizedTransforms.includes(transform) && paletteName('both_eyes', transform).startsWith('theme__')
  )
  const remaining = transforms.filter(
    (transform) => !allCategorizedTransforms.includes(transform) && !themes.includes(transform)
  )

  const allGroupNames = eyePaletteGroups.map((group) => group.name) // Derive all group names from the eyePaletteGroups

  return (
    <>
      {allGroupNames.map((groupName) => {
        const categoryTransforms = categorizedTransforms[groupName]
        return (
          categoryTransforms &&
          categoryTransforms.length > 0 && (
            <AvatarTransformsPickerSection
              key={`AvatarPickerSection-${groupName}-pattern`}
              label={' '} // You can use groupName here if you want labels for each category
              avatar={avatar}
              gridLayoutType={UIGridLayoutType.GroupByRows}
              transforms={categoryTransforms}
              hideClothes={false}
              onClickAvatar={onClickAvatar}
              showScrollToastOnClick={true}
            />
          )
        )
      })}
      {themes && themes.length > 0 && (
        <AvatarTransformsPickerSection
          key={`AvatarPickerSection-themes-pattern`}
          label={'Themes'}
          avatar={avatar}
          gridLayoutType={UIGridLayoutType.Compact}
          transforms={themes}
          hideClothes={false}
          onClickAvatar={onClickAvatar}
          showScrollToastOnClick={true}
        />
      )}
      {remaining && remaining.length > 0 && (
        <AvatarTransformsPickerSection
          key={`AvatarPickerSection-remaining-pattern`}
          label={'Remaining'}
          avatar={avatar}
          gridLayoutType={UIGridLayoutType.Compact}
          transforms={remaining}
          hideClothes={false}
          onClickAvatar={onClickAvatar}
          showScrollToastOnClick={true}
        />
      )}
    </>
  )
}

export default AvatarEyesPickerSection
