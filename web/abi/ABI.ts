import { Chain } from 'wagmi'
import OpenAvatarGen0AssetsArtifact from './OpenAvatarGen0Assets.json'
import OpenAvatarGen0ExampleMutableCanvasRendererArtifact from './OpenAvatarGen0ExampleMutableCanvasRenderer.json'
import OpenAvatarGen0ProfilePictureRendererArtifact from './OpenAvatarGen0ProfilePictureRenderer.json'
import OpenAvatarGen0RendererArtifact from './OpenAvatarGen0Renderer.json'
import OpenAvatarGen0RendererRegistryArtifact from './OpenAvatarGen0RendererRegistry.json'
import OpenAvatarGen0TextRecordsArtifact from './OpenAvatarGen0TextRecords.json'
import OpenAvatarGen0TokenArtifact from './OpenAvatarGen0Token.json'
import OwnerProxyArtifact from './OwnerProxy.json'

export enum Deployable {
  OwnerProxy = 'OwnerProxy',
  OpenAvatarGen0Assets = 'OpenAvatarGen0Assets',
  OpenAvatarGen0Renderer = 'OpenAvatarGen0Renderer',
  OpenAvatarGen0RendererRegistry = 'OpenAvatarGen0RendererRegistry',
  OpenAvatarGen0Token = 'OpenAvatarGen0Token',
  OpenAvatarGen0TextRecords = 'OpenAvatarGen0TextRecords',
  OpenAvatarGen0ProfilePictureRenderer = 'OpenAvatarGen0ProfilePictureRenderer',
  OpenAvatarGen0ExampleMutableCanvasRenderer = 'OpenAvatarGen0ExampleMutableCanvasRenderer',
}

export const ABI = {
  [Deployable.OwnerProxy]: OwnerProxyArtifact.abi,
  [Deployable.OpenAvatarGen0Assets]: OpenAvatarGen0AssetsArtifact.abi,
  [Deployable.OpenAvatarGen0Renderer]: OpenAvatarGen0RendererArtifact.abi,
  [Deployable.OpenAvatarGen0RendererRegistry]: OpenAvatarGen0RendererRegistryArtifact.abi,
  [Deployable.OpenAvatarGen0Token]: OpenAvatarGen0TokenArtifact.abi,
  [Deployable.OpenAvatarGen0TextRecords]: OpenAvatarGen0TextRecordsArtifact.abi,
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: OpenAvatarGen0ProfilePictureRendererArtifact.abi,
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: OpenAvatarGen0ExampleMutableCanvasRendererArtifact.abi,
}

const LOCAL_CREATE2_DEPLOYMENT_ADDRESSES: Record<string, `0x${string}`> = {
  [Deployable.OwnerProxy]: '0xB669E5377449C3c7792d09FA9242054a40E285b3',
  [Deployable.OpenAvatarGen0Assets]: '0xe944d36e70A6fB6132327c499Fd2f9190191a728',
  [Deployable.OpenAvatarGen0Renderer]: '0x9988Fb1A564A492a2d15aE17EFBA1E7e57D2F890',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0xF891040c82e2dE7E954b48AaaC771D70c98d3565',
  [Deployable.OpenAvatarGen0Token]: '0x0d4A851305C77dec41de3A50477d3dCcbE20F8Cd',
  [Deployable.OpenAvatarGen0TextRecords]: '0xD283Be00a470C83EBE42CBAA5F2986Dd11910E40',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x7d95a980220b9D94d3cbd859D5eAa0fb34cE3FfF',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0xEFd639E21d169c5AB9589F1c0BB659316Cf2A95c',
}

interface IContractConfigs {
  [Deployable.OwnerProxy]: {
    abi: typeof OwnerProxyArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0Assets]: {
    abi: typeof OpenAvatarGen0AssetsArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0Renderer]: {
    abi: typeof OpenAvatarGen0RendererArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0RendererRegistry]: {
    abi: typeof OpenAvatarGen0RendererRegistryArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0Token]: {
    abi: typeof OpenAvatarGen0TokenArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0TextRecords]: {
    abi: typeof OpenAvatarGen0TextRecordsArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: {
    abi: typeof OpenAvatarGen0ProfilePictureRendererArtifact.abi
    address: `0x${string}`
  }
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: {
    abi: typeof OpenAvatarGen0ExampleMutableCanvasRendererArtifact.abi
    address: `0x${string}`
  }
}

const LocalContractConfigs: IContractConfigs = {
  [Deployable.OwnerProxy]: {
    abi: ABI[Deployable.OwnerProxy],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy],
  },
  [Deployable.OpenAvatarGen0Assets]: {
    abi: ABI[Deployable.OpenAvatarGen0Assets],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Assets],
  },
  [Deployable.OpenAvatarGen0Renderer]: {
    abi: ABI[Deployable.OpenAvatarGen0Renderer],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Renderer],
  },
  [Deployable.OpenAvatarGen0RendererRegistry]: {
    abi: ABI[Deployable.OpenAvatarGen0RendererRegistry],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0RendererRegistry],
  },
  [Deployable.OpenAvatarGen0Token]: {
    abi: ABI[Deployable.OpenAvatarGen0Token],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Token],
  },
  [Deployable.OpenAvatarGen0TextRecords]: {
    abi: ABI[Deployable.OpenAvatarGen0TextRecords],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0TextRecords],
  },
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: {
    abi: ABI[Deployable.OpenAvatarGen0ProfilePictureRenderer],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0ProfilePictureRenderer],
  },
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: {
    abi: ABI[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer],
    address: LOCAL_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer],
  },
}

export const ContractConfigs = LocalContractConfigs

const PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES: Record<string, `0x${string}`> = {
  [Deployable.OwnerProxy]: '0x00000000000027390b412440C58100929AcfEAe2',
  [Deployable.OpenAvatarGen0Assets]: '0x0000000000002e49c53D50F29503a882a74D25Ec',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0x0000000000002ebafE656fe156fCeBb9435f662A',
  [Deployable.OpenAvatarGen0Renderer]: '0x00000000000006FDeB6F46bb3fe4439eE5430351',
  [Deployable.OpenAvatarGen0Token]: '0x0000000000000138Bd6bd34CF4A3905576f58e25',
  [Deployable.OpenAvatarGen0TextRecords]: '0x00000000000029F69177DcE0c57A81c9b73c02CE',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x00000000000008a2729597332F9a33757F6468A6',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0x0000000000000000000000000000000000000008',
}
const PublicContractConfigs: IContractConfigs = {
  [Deployable.OwnerProxy]: {
    abi: ABI[Deployable.OwnerProxy],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy],
  },
  [Deployable.OpenAvatarGen0Assets]: {
    abi: ABI[Deployable.OpenAvatarGen0Assets],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Assets],
  },
  [Deployable.OpenAvatarGen0Renderer]: {
    abi: ABI[Deployable.OpenAvatarGen0Renderer],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Renderer],
  },
  [Deployable.OpenAvatarGen0RendererRegistry]: {
    abi: ABI[Deployable.OpenAvatarGen0RendererRegistry],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0RendererRegistry],
  },
  [Deployable.OpenAvatarGen0Token]: {
    abi: ABI[Deployable.OpenAvatarGen0Token],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0Token],
  },
  [Deployable.OpenAvatarGen0TextRecords]: {
    abi: ABI[Deployable.OpenAvatarGen0TextRecords],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0TextRecords],
  },
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: {
    abi: ABI[Deployable.OpenAvatarGen0ProfilePictureRenderer],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0ProfilePictureRenderer],
  },
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: {
    abi: ABI[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer],
    address: PUBLIC_CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer],
  },
}

export function getContractConfigs(
  chain: (Chain & { unsupported?: boolean | undefined }) | undefined
): IContractConfigs {
  if (chain?.id === 1337) {
    return LocalContractConfigs
  } else {
    return PublicContractConfigs
  }
}
