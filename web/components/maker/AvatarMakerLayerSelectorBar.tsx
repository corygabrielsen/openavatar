import { Avatar, AvatarLayerStack } from '@openavatar/types'
import styles from '../../styles/maker/AvatarMakerLayerSelectorBar.module.scss'
import AvatarButton from './AvatarButton'
import { AvatarMakerCategories, AvatarMakerCategory } from './AvatarMakerCategory'

interface Props {
  avatar: Avatar
  selectedCategory: AvatarMakerCategory
  onChangeCategory: (category: AvatarMakerCategory) => void
}

const AvatarMakerLayerSelectorBar = ({ avatar, selectedCategory, onChangeCategory }: Props) => {
  const renderButtons = () => {
    const categories = Object.values(AvatarMakerCategory)
    const buttons = []
    for (const category of categories) {
      const showLayers = Array.from(new Set([AvatarLayerStack.body, ...AvatarMakerCategories[category]]))
      const button = (
        <div className={styles.barItem} key={`barItem-${category}`}>
          <AvatarButton
            onClick={() => onChangeCategory(category)}
            label={category}
            avatar={avatar}
            showLayers={showLayers}
            selected={selectedCategory === category}
          />
        </div>
      )
      buttons.push(button)
    }
    return buttons
  }
  return (
    <div className={styles.container}>
      <div className={styles.bar}>{renderButtons()}</div>
    </div>
  )
}

export default AvatarMakerLayerSelectorBar
