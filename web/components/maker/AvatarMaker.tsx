import { Avatar, AvatarLayerStack } from '@openavatar/types'
import { forwardRef, useEffect, useState } from 'react'
import styles from '../../styles/maker/AvatarMaker.module.scss'
import Toast from '../Toast'
import AvatarSpriteRender from '../avatar/sprite/AvatarSpriteRender'
import HelperControls from '../mint/HelperControls'
import { AvatarMakerCategory } from './AvatarMakerCategory'
import AvatarMakerLayerSelectorBar from './AvatarMakerLayerSelectorBar'
import AvatarClothesPicker from './picker/AvatarClothesPicker'
import AvatarEyesPicker from './picker/AvatarEyesPicker'
import AvatarFacialHairPicker from './picker/AvatarFacialHairPicker'
import AvatarHairPicker from './picker/AvatarHairPicker'
import AvatarLayerTwoPartPicker from './picker/AvatarLayerTwoPartPicker'

interface Props {
  avatar: Avatar
  onChangeAvatar: (avatar: Avatar) => void
  // helpercontrols
  numPrevHistoryAvatars: number
  numNextHistoryAvatars: number
  onRandomizeAvatar: () => void
  onSelectPrevHistoryAvatar: () => Avatar | null
  onSelectNextHistoryAvatar: () => Avatar | null
}

const AvatarMaker = forwardRef<HTMLDivElement, Props>(
  (
    {
      avatar,
      onChangeAvatar,
      numPrevHistoryAvatars,
      numNextHistoryAvatars,
      onRandomizeAvatar,
      onSelectPrevHistoryAvatar,
      onSelectNextHistoryAvatar,
      // ... other props if any
    },
    ref
  ) => {
    const [selectedAvatar, setSelectedAvatar] = useState(avatar)
    const [selectedCategory, setSelectedCategory] = useState(AvatarMakerCategory.BODY)
    useEffect(() => {
      setSelectedAvatar(avatar)
    }, [avatar])
    if (!avatar.equals(selectedAvatar)) {
      // console.error('AvatarMaker: avatar and selectedAvatar are not equal. Bug?')
    }

    const handleOnChangeCategory = (category: AvatarMakerCategory) => {
      console.log(`Selected category: ${category}`)
      setSelectedCategory(category)
    }

    const handleOnChangeAvatar = (avatar: Avatar) => {
      // console.log(`Selected avatar: ${avatar.dna.toString()}`)
      setSelectedAvatar(avatar)
      onChangeAvatar(avatar)
    }

    return (
      <div className={styles.container} ref={ref}>
        <div className={styles.avatarSpriteContainer}>
          <AvatarSpriteRender render="offchain" source={selectedAvatar} height={256} width={256} />
          <HelperControls
            numPrevHistoryAvatars={numPrevHistoryAvatars}
            numNextHistoryAvatars={numNextHistoryAvatars}
            onRandomizeAvatar={onRandomizeAvatar}
            onSelectPrevHistoryAvatar={onSelectPrevHistoryAvatar}
            onSelectNextHistoryAvatar={onSelectNextHistoryAvatar}
          />
          <Toast text="100% onchain, hand-drawn" />
        </div>
        <div className={styles.main}>
          <div className={styles.avatarControls}>
            <AvatarMakerLayerSelectorBar
              avatar={selectedAvatar}
              selectedCategory={selectedCategory}
              onChangeCategory={handleOnChangeCategory}
            />
          </div>
          <div className={styles.avatarPicker}>
            {/* {selectedCategory === AvatarMakerCategory.BODY && (
            <AvatarBodyPicker avatar={selectedAvatar} onClickAvatar={handleOnChangeAvatar} />
          )} */}
            {selectedCategory === AvatarMakerCategory.BODY && (
              <AvatarLayerTwoPartPicker
                layer={AvatarLayerStack.body}
                avatar={selectedAvatar}
                onClickAvatar={handleOnChangeAvatar}
                excludePatternNames={['invisible']}
              />
            )}
            {selectedCategory === AvatarMakerCategory.TATTOOS && (
              <AvatarLayerTwoPartPicker
                layer={AvatarLayerStack.tattoos}
                avatar={selectedAvatar}
                onClickAvatar={handleOnChangeAvatar}
              />
            )}
            {selectedCategory === AvatarMakerCategory.EYES && (
              <AvatarEyesPicker avatar={selectedAvatar} onClickAvatar={handleOnChangeAvatar} />
            )}
            {selectedCategory === AvatarMakerCategory.FACIAL_HAIR && (
              <AvatarFacialHairPicker avatar={selectedAvatar} onClickAvatar={handleOnChangeAvatar} />
            )}
            {selectedCategory === AvatarMakerCategory.HAIR && (
              <AvatarHairPicker avatar={selectedAvatar} onClickAvatar={handleOnChangeAvatar} />
            )}
            {selectedCategory === AvatarMakerCategory.MAKEUP && (
              <AvatarLayerTwoPartPicker
                layer={AvatarLayerStack.makeup}
                avatar={selectedAvatar}
                onClickAvatar={handleOnChangeAvatar}
                suggestedSearchTerms={['blush', 'eye_shadow', 'lipstick', 'warpaint']}
              />
            )}
            {selectedCategory === AvatarMakerCategory.JEWELRY && (
              <AvatarLayerTwoPartPicker
                layer={AvatarLayerStack.jewelry}
                avatar={selectedAvatar}
                onClickAvatar={handleOnChangeAvatar}
                suggestedSearchTerms={['bracelet', 'chain', 'earring', 'medallion']}
                maxPatternCols={8}
              />
            )}
            {selectedCategory === AvatarMakerCategory.EYEWEAR && (
              <AvatarLayerTwoPartPicker
                layer={AvatarLayerStack.eyewear}
                avatar={selectedAvatar}
                onClickAvatar={handleOnChangeAvatar}
                suggestedSearchTerms={['ar', 'face_shield', 'glasses', 'led', 'sunshield', 'vr']}
              />
            )}
            {/* {selectedCategory === AvatarMakerCategory.FACEWEAR && (
            <AvatarLayerTwoPartPicker
              layer={AvatarLayerStack.facewear}
              avatar={selectedAvatar}
              onClickAvatar={handleOnChangeAvatar}
            />
          )} */}
            {selectedCategory === AvatarMakerCategory.CLOTHES && (
              <AvatarClothesPicker avatar={selectedAvatar} onClickAvatar={handleOnChangeAvatar} />
            )}
            <Toast text="🧬 Every avatar has unique DNA. 🧬" lightMode={true} />
          </div>
          {/* <div className={styles.properties}>
          <AvatarProperties avatar={selectedAvatar} />
        </div> */}
        </div>
      </div>
    )
  }
)

AvatarMaker.displayName = 'AvatarMaker'

export default AvatarMaker
