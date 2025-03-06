import { Avatar, AvatarLayerStack } from '@openavatar/types'
import { useEffect, useState } from 'react'
import { useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../../abi/ABI'
import style from '../../../styles/avatar/properties/AvatarProperties.module.scss'

interface OpenAvatarURIPropertiesProps {
  avatar: Avatar
  openAvatarURI?: string
}
const OpenAvatarURIProperties: React.FC<OpenAvatarURIPropertiesProps> = ({ avatar, openAvatarURI }) => {
  if (!openAvatarURI) {
    return <p>Fetching openAvatarURI...</p>
  }
  // console.log('openAvatarURI', openAvatarURI)

  const base64 = openAvatarURI.split('data:application/json;base64,')[1]
  const decoded = Buffer.from(base64, 'base64').toString('ascii')
  const obj = JSON.parse(decoded)
  const tokenId: number = obj.token_id
  const generation: number = obj.generation
  const renderer: string = obj.renderer
  const creator: string = obj.creator

  return (
    <>
      <label className={style.gridLabel}>
        <div>token id</div>
      </label>
      <p className={style.gridValue}>{tokenId}</p>
      <label className={style.gridLabel}>
        <div>DNA</div>
      </label>
      <div className={style.gridValue}>
        <p className={style.dna}>{avatar.dna.toString()}</p>
      </div>
      <label className={style.gridLabel}>
        <div>generation</div>
      </label>
      <p className={style.gridValue}>{generation}</p>
      <label className={style.gridLabel}>
        <div>creator</div>
      </label>
      <p className={style.gridValue}>{creator}</p>
      <label className={style.gridLabel}>
        <div>renderer</div>
      </label>
      <p className={style.gridValue}>{renderer}</p>
    </>
  )
}

interface Props {
  avatar: Avatar
}
const AvatarTokenProperties = ({ avatar }: Props) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { chain } = useNetwork()

  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0Token,
    functionName: 'openAvatarURI',
    args: [avatar.dna.toString()],
  }
  const { data: openAvatarURI, isLoading: getDNALoading, isError: getDNAError } = useContractRead(useContractReadParams)

  const layerEntries = []

  for (const layer of AvatarLayerStack.iter()) {
    const prettyPaletteName = avatar.get(layer).palette.name.replace('theme__', '').replace('transparent', '-')
    layerEntries.push(
      <label className={style.gridLabel} key={layer.name}>
        {layer.name}
      </label>,
      <div key={`${layer.name}-pattern-palette`} className={`${style.gridValue} ${style.patternPalette}`}>
        <div className={style.patternPalleteEntry}>
          <div>
            {avatar.dna.toString() === '0x0000000000000000000000000000000000000000000000000000000000000000'
              ? '-'
              : avatar.get(layer).pattern.name.replace('naked', '-').replace('none', '-')}
          </div>
        </div>
        <div className={style.patternPalleteEntry}>
          <div>{prettyPaletteName}</div>
        </div>
      </div>
    )
  }

  return (
    <section className={style.container}>
      <div className={style.grid}>
        {mounted && <OpenAvatarURIProperties avatar={avatar} openAvatarURI={openAvatarURI as unknown as string} />}
        {layerEntries}
      </div>
    </section>
  )
}

export default AvatarTokenProperties
