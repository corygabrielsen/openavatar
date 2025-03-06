import { Avatar } from '@openavatar/types'
import { useContractRead, useNetwork } from 'wagmi'
import { getContractConfigs } from '../../../abi/ABI'
import { ProfilePictureSettings } from '../pfp/ProfilePictureSettings'

export type Base64SVGURI = `data:image/svg+xml;base64,${string}`

class AvatarRender {
  constructor(private readonly base64SVGURI: Base64SVGURI) {
    this.base64SVGURI = base64SVGURI
  }

  public getBase64SVGURI(): Base64SVGURI {
    return this.base64SVGURI
  }

  public getSVG(): string {
    return Buffer.from(this.base64SVGURI.slice('data:image/svg+xml;base64,'.length), 'base64').toString('utf8')
  }

  public static parsePngFromSvg(svgString: string): Buffer {
    const regex = /<img[^>]*src="data:image\/png;base64,([^"]+)"/
    const match = regex.exec(svgString)
    if (!match) {
      throw new Error('invalid svg')
    }
    const base64Png = match[1]
    const decoded: Buffer = Buffer.from(base64Png, 'base64')

    return decoded
  }

  public getPNG(): Buffer {
    const svg: string = this.getSVG()
    // get the data:image/png;base64, part
    return AvatarRender.parsePngFromSvg(svg)
  }
}

export function useAvatarSVG(avatar: Avatar, pfpSettings?: ProfilePictureSettings) {
  const functionName = pfpSettings === undefined ? 'renderURI' : 'renderURIWithSettings'
  const args: any[] = [avatar.dna.toString()]
  if (pfpSettings !== undefined) {
    args.push({
      overrideBackground: pfpSettings.overrideBackground,
      backgroundColor: pfpSettings.backgroundColor.replace('#', '0x'),
      maskBelowTheNeck: pfpSettings.maskBelowTheNeck,
    })
  }
  const { chain } = useNetwork()
  const useContractReadParams = {
    ...getContractConfigs(chain).OpenAvatarGen0ProfilePictureRenderer,
    functionName,
    args,
    enabled: avatar !== undefined,
  }
  const { data, isLoading, isError } = useContractRead(useContractReadParams)

  let render: AvatarRender | undefined =
    data === undefined ? undefined : new AvatarRender(data as unknown as Base64SVGURI)

  return { render, isLoading, isError }
}
