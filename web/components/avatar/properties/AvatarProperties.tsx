import { Avatar, AvatarLayerStack } from '@openavatar/types'
import style from '../../../styles/avatar/properties/AvatarProperties.module.scss'

interface Props {
  avatar: Avatar
}

const AvatarProperties = ({ avatar }: Props) => {
  const layerEntries = []

  for (const layer of AvatarLayerStack.iter()) {
    const prettyPaletteName = avatar.get(layer).palette.name.split('__')[-1]
    layerEntries.push(
      <label key={layer.name}>{layer.name}</label>,
      <div key={`${layer.name}-pattern-palette`} className={style.patternPallete}>
        <p className={style.patternPalleteEntry}>{avatar.get(layer).pattern.name}</p>
        <p className={style.patternPalleteEntry}>{prettyPaletteName}</p>
      </div>
    )
  }

  return (
    <section className={style.container}>
      <label>
        <div>DNA</div>
      </label>
      <div className={style.value}>
        <p className={style.dna}>{avatar.dna.toString()}</p>
      </div>
      {layerEntries}
    </section>
  )
}

export default AvatarProperties
