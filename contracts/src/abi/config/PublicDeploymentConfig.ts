import { stringToBytes32 } from '../../util/StringUtils'
import { Artifacts } from '../Artifacts'
import { OWNER_PROXY_MASTER } from '../Constants'
import { ContractConfig } from '../ContractConfig'
import { Deployable } from '../Deployable'
import { DeployType, DeploymentConfig } from '../DeploymentConfig'
import { ensureUniqueAddresses } from '../Utils'

const DEPLOYER_ADDRESS = '0x000000004d8656ac38379a6ABF3ba6E800785E92'

const DEPLOY_ORDER: `0x${string}`[] = ['0xB6dc1aFcf1148d57CBd5994d5F3631234Fe3C64C']

const CREATE2_DEPLOYMENT_ADDRESSES = {
  [Deployable.ImmutableCreate2Factory]: DEPLOY_ORDER[0],
  [Deployable.OwnerProxy]: '0x00000000000027390b412440C58100929AcfEAe2',
  [Deployable.OpenAvatarGen0Assets]: '0x0000000000002e49c53D50F29503a882a74D25Ec',
  [Deployable.OpenAvatarGen0RendererRegistry]: '0x0000000000002ebafE656fe156fCeBb9435f662A',
  [Deployable.OpenAvatarGen0Renderer]: '0x00000000000006FDeB6F46bb3fe4439eE5430351',
  [Deployable.OpenAvatarGen0Token]: '0x0000000000000138Bd6bd34CF4A3905576f58e25',
  [Deployable.OpenAvatarGen0TextRecords]: '0x00000000000029F69177DcE0c57A81c9b73c02CE',
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: '0x00000000000008a2729597332F9a33757F6468A6',
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: '0x0000000000000000000000000000000000000008',
}

const Salts: Record<string, { args: any[]; bestKnownSalt: Buffer }> = {
  [Deployable.ImmutableCreate2Factory]: {
    args: [],
    bestKnownSalt: stringToBytes32('0x0'),
  },
  [Deployable.OwnerProxy]: {
    args: [OWNER_PROXY_MASTER],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e928263865bf253610293cceff5'),
  },
  [Deployable.OpenAvatarGen0Assets]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e9272a142f748828f03d061235b'),
  },
  [Deployable.OpenAvatarGen0RendererRegistry]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e92e74c26eee8d15c022620e257'),
  },
  [Deployable.OpenAvatarGen0Renderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e924afce6e42affd902cdcc4860'),
  },
  [Deployable.OpenAvatarGen0Token]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e928cf9c081bab845015d10e89c'),
  },
  [Deployable.OpenAvatarGen0TextRecords]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e92197d077487efaa0064b45342'),
  },
  [Deployable.OpenAvatarGen0ProfilePictureRenderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x000000004d8656ac38379a6abf3ba6e800785e92cca5a6c58e28be013825e19f'),
  },
  [Deployable.OpenAvatarGen0ExampleMutableCanvasRenderer]: {
    args: [CREATE2_DEPLOYMENT_ADDRESSES[Deployable.OwnerProxy]],
    bestKnownSalt: stringToBytes32('0x0'),
  },
}

const ContractConfigs: Record<string, ContractConfig> = Object.values(Deployable).reduce(
  (acc, name, i) => ({
    ...acc,
    [name]: {
      abi: Artifacts.get(name)?.abi,
      bytecode: Artifacts.get(name)?.bytecode,
      deployedBytecode: Artifacts.get(name)?.deployedBytecode,
      create2Address: CREATE2_DEPLOYMENT_ADDRESSES[name],
      nonCreate2Address: DEPLOY_ORDER[i],
      args: Salts[name].args,
      bestKnownSalt: Salts[name].bestKnownSalt,
    },
  }),
  {}
)

// ensure uniqueness of addresses to prevent refactor bugs
ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.create2Address))
// ensureUniqueAddresses(Object.values(ContractConfigs).map((c) => c.nonCreate2Address))

export const PublicDeploymentConfig: DeploymentConfig = {
  type: DeployType.PUBLIC,
  deployer: DEPLOYER_ADDRESS,
  contractConfigs: ContractConfigs,
}
