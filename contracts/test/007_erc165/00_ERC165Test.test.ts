import { AvatarPose } from '@openavatar/types'
import { expect } from 'chai'
import fs from 'fs'
import { ethers } from 'hardhat'
import path from 'path'
import { OpenAvatarGen0Assets } from '../../src/client/OpenAvatarGen0Assets'
import { OpenAvatarGen0Renderer } from '../../src/client/OpenAvatarGen0Renderer'
import { OpenAvatarGen0RendererRegistry } from '../../src/client/OpenAvatarGen0RendererRegistry'
import { OpenAvatarGen0TextRecords } from '../../src/client/OpenAvatarGen0TextRecords'
import { OpenAvatarGen0Token } from '../../src/client/OpenAvatarGen0Token'
import { OpenAvatarGen0AssetsCanvasStore } from '../../src/client/core/assets/OpenAvatarGen0AssetsCanvasStore'
import { OpenAvatarGen0AssetsPaletteStore } from '../../src/client/core/assets/OpenAvatarGen0AssetsPaletteStore'
import { OpenAvatarGen0AssetsPatternStore } from '../../src/client/core/assets/OpenAvatarGen0AssetsPatternStore'
import { OpenAvatarGen0AssetsCanvasLayerCompositor } from '../../src/client/core/render/OpenAvatarGen0AssetsCanvasLayerCompositor'
import { OpenAvatarGen0ProfilePictureRenderer } from '../../src/client/extensions/OpenAvatarGen0ProfilePictureRenderer'
import { PROJECT_CONTRACTS_DIR } from '../../src/util/FileUtils'
import { TestHelper } from '../TestHelper'
import { TestImageData } from '../TestImageData'

const WIDTH = 32
const HEIGHT = 32
const POSE = AvatarPose.IdleDown0

interface ContractInterfaceArtifact {
  subdir?: string
  filename: string
  interfaceName: string
}

const INTERFACES_OPENAVATAR_GENERATION_ZERO: ContractInterfaceArtifact[] = [
  { filename: 'IOpenAvatar', interfaceName: 'IOpenAvatarGeneration' },
  { filename: 'IOpenAvatar', interfaceName: 'IOpenAvatarSentinel' },
  { filename: 'IOpenAvatar', interfaceName: 'IOpenAvatar' },
]

const INTERFACES_BY_CONTRACT_NAME: Record<string, ContractInterfaceArtifact[]> = {}
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsPaletteStore'] = [
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPaletteStore',
    interfaceName: 'IOpenAvatarGen0AssetsPaletteStoreRead',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPaletteStore',
    interfaceName: 'IOpenAvatarGen0AssetsPaletteStoreWrite',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPaletteStore',
    interfaceName: 'IOpenAvatarGen0AssetsPaletteStore',
  },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsCanvasStore'] = [
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsCanvasStore',
    interfaceName: 'IOpenAvatarGen0AssetsCanvasStoreRead',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsCanvasStore',
    interfaceName: 'IOpenAvatarGen0AssetsCanvasStoreWrite',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsCanvasStore',
    interfaceName: 'IOpenAvatarGen0AssetsCanvasStore',
  },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsPatternStore'] = [
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsPaletteStore'],
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsCanvasStore'],
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPatternStore',
    interfaceName: 'IOpenAvatarGen0AssetsPatternStoreRead',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPatternStore',
    interfaceName: 'IOpenAvatarGen0AssetsPatternStoreWrite',
  },
  {
    subdir: 'core/interfaces/assets/',
    filename: 'IOpenAvatarGen0AssetsPatternStore',
    interfaceName: 'IOpenAvatarGen0AssetsPatternStore',
  },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0Assets'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsPaletteStore'],
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsCanvasStore'],
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsPatternStore'],
  { filename: 'IOpenAvatarGen0Assets', interfaceName: 'IOpenAvatarGen0AssetsRead' },
  { filename: 'IOpenAvatarGen0Assets', interfaceName: 'IOpenAvatarGen0AssetsWrite' },
  { filename: 'IOpenAvatarGen0Assets', interfaceName: 'IOpenAvatarGen0Assets' },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsCanvasLayerCompositor'] = [
  {
    subdir: 'core/interfaces/render/',
    filename: 'IOpenAvatarGen0AssetsCanvasLayerCompositor',
    interfaceName: 'IOpenAvatarGen0AssetsCanvasLayerCompositor',
  },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0CanvasRenderer'] = [
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0AssetsCanvasLayerCompositor'],
  {
    subdir: 'core/interfaces/render/',
    filename: 'IOpenAvatarGen0CanvasRenderer',
    interfaceName: 'IOpenAvatarGen0CanvasRenderer',
  },
  { filename: 'IOpenAvatarGen0Renderer', interfaceName: 'IOpenAvatarGen0Renderer' },
  { filename: 'IOpenAvatarGen0Renderer', interfaceName: 'IOpenAvatarGen0RendererDecorator' },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0Renderer'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  ...INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0CanvasRenderer'],
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0RendererRegistry'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  { filename: 'IOpenAvatarGen0RendererRegistry', interfaceName: 'IOpenAvatarGen0RendererRegistry' },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0Token'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  // renderer
  { filename: 'IOpenAvatarGen0Renderer', interfaceName: 'IOpenAvatarGen0Renderer' },
  // token
  {
    filename: 'IOpenAvatarGen0Token',
    interfaceName: 'IOpenAvatarGen0TokenMintRead',
  },
  {
    filename: 'IOpenAvatarGen0Token',
    interfaceName: 'IOpenAvatarGen0TokenMintWrite',
  },
  {
    filename: 'IOpenAvatarGen0Token',
    interfaceName: 'IOpenAvatarGen0TokenMintAdmin',
  },
  {
    filename: 'IOpenAvatarGen0Token',
    interfaceName: 'IOpenAvatarGen0TokenMint',
  },
  { filename: 'IOpenAvatarGen0Token', interfaceName: 'IOpenAvatarGen0TokenMetadata' },
  { filename: 'IOpenAvatarGen0Token', interfaceName: 'IOpenAvatarGen0TokenDNA' },
  { filename: 'IOpenAvatarGen0Token', interfaceName: 'IOpenAvatarGen0Token' },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0TextRecords'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  { subdir: 'core/dependencies/', filename: 'IERC634', interfaceName: 'IERC634' },
  { filename: 'IOpenAvatarGen0TextRecords', interfaceName: 'IOpenAvatarGen0TextRecords' },
]
INTERFACES_BY_CONTRACT_NAME['OpenAvatarGen0ProfilePictureRenderer'] = [
  ...INTERFACES_OPENAVATAR_GENERATION_ZERO,
  { filename: 'IOpenAvatarGen0Renderer', interfaceName: 'IOpenAvatarGen0Renderer' },
]

describe('ERC-165', function () {
  let openAvatarGen0AssetsPaletteStore: OpenAvatarGen0AssetsPaletteStore
  let openAvatarGen0AssetsCanvasStore: OpenAvatarGen0AssetsCanvasStore
  let openAvatarGen0AssetsPatternStore: OpenAvatarGen0AssetsPatternStore
  let openAvatarGen0Assets: OpenAvatarGen0Assets
  let openAvatarGen0AssetsCanvasLayerCompositor: OpenAvatarGen0AssetsCanvasLayerCompositor
  let openAvatarGen0Renderer: OpenAvatarGen0Renderer
  let openAvatarGen0CanvasRenderer: OpenAvatarGen0Renderer
  let openAvatarGen0RendererRegistry: OpenAvatarGen0RendererRegistry
  let openAvatarGen0Token: OpenAvatarGen0Token
  let openAvatarGen0TextRecords: OpenAvatarGen0TextRecords
  let openAvatarGen0ProfilePictureRenderer: OpenAvatarGen0ProfilePictureRenderer

  let testRef: any

  async function doInit() {
    openAvatarGen0AssetsPaletteStore = await TestHelper.initOpenAvatarGen0AssetsPaletteStore(ethers)
    openAvatarGen0AssetsCanvasStore = await TestHelper.initOpenAvatarGen0AssetsCanvasStore(ethers)
    openAvatarGen0AssetsPatternStore = await TestHelper.initOpenAvatarGen0AssetsPatternStore(ethers)
    openAvatarGen0Assets = await TestHelper.initOpenAvatarGen0Assets(ethers)
    await openAvatarGen0Assets.addCanvas({ id: POSE.canvasId, width: WIDTH, height: HEIGHT })
    await openAvatarGen0Assets.uploadPalette(POSE.canvasId, 0, TestImageData.PALETTE_ONE_COLOR_TRANSPARENT)
    openAvatarGen0AssetsCanvasLayerCompositor = await TestHelper.initOpenAvatarGen0AssetsCanvasLayerCompositor(
      ethers,
      openAvatarGen0Assets
    )
    openAvatarGen0CanvasRenderer = await TestHelper.initOpenAvatarGen0CanvasRenderer(ethers, openAvatarGen0Assets, POSE)
    openAvatarGen0Renderer = await TestHelper.initOpenAvatarGen0Renderer(ethers, openAvatarGen0Assets)
    openAvatarGen0RendererRegistry = await TestHelper.initOpenAvatarGen0RendererRegistry(ethers, {
      key: 'base',
      openAvatarGen0Renderer,
    })
    openAvatarGen0Token = await TestHelper.initOpenAvatarGen0Token(ethers, openAvatarGen0RendererRegistry)
    openAvatarGen0TextRecords = await TestHelper.initOpenAvatarGen0TextRecords(ethers, openAvatarGen0Token)
    openAvatarGen0ProfilePictureRenderer = await TestHelper.initOpenAvatarGen0ProfilePictureRenderer(
      ethers,
      openAvatarGen0Assets,
      openAvatarGen0Renderer,
      openAvatarGen0Token,
      openAvatarGen0TextRecords
    )
  }

  before(doInit)

  function readArtifact(contractName: string, interfaceName: string, subdir?: string): any {
    // Read the artifact
    let rawdata = fs.readFileSync(
      `${PROJECT_CONTRACTS_DIR}/artifacts/contracts/${path.join(subdir || '', contractName)}.sol/${interfaceName}.json`
    )
    return JSON.parse(rawdata.toString())
  }

  interface InterfaceERC165Info {
    contractName: string
    interfaceName: string
    functionSignatures: string[]
    functionSelectors: string[]
    interfaceId: string
  }

  function readERC165Info(contractName: string, interfaceName: string, subdir?: string): InterfaceERC165Info {
    // Read the artifact
    let artifact = readArtifact(contractName, interfaceName, subdir)

    // Extract the function signatures from the ABI
    let functionSignatures: string[] = artifact.abi
      .filter((entry: any) => entry.type === 'function')
      .map((entry: any) => {
        let inputs = entry.inputs.map((input: any) => input.type).join(',')
        const signature = `${entry.name}(${inputs})`
        // console.log(`function: ${signature}`)
        return signature
      })

    // Compute the XOR of the function selectors
    let interfaceId = ethers.BigNumber.from(0)
    for (let signature of functionSignatures) {
      let selector = ethers.utils.id(signature).slice(0, 10) // Keccak-256 hash of the signature, then take first 4 bytes
      //   console.log(`selector: ${selector}`)
      interfaceId = interfaceId.xor(ethers.BigNumber.from(selector))
    }

    return {
      contractName: contractName,
      interfaceName: interfaceName,
      functionSignatures: functionSignatures,
      functionSelectors: functionSignatures.map((signature) => ethers.utils.id(signature).slice(0, 10)),
      interfaceId: '0x' + interfaceId.toHexString().slice(2).padStart(8, '0'),
    }
  }

  function testSuite(contractName: string, beforeFunc: () => Promise<void>) {
    describe(contractName, function () {
      before(async function () {
        await beforeFunc()
      })

      it(`${contractName} should have ERC-165 support for ERC165 (0x01ffc9a7)`, async function () {
        // interfaceId == 0x01ffc9a7 || // ERC165 interface ID for ERC165.
        expect(await testRef.supportsInterface('0x01ffc9a7')).to.equal(true)
      })

      for (const contractInterfaceArtifact of INTERFACES_BY_CONTRACT_NAME[contractName]) {
        const info: InterfaceERC165Info = readERC165Info(
          contractInterfaceArtifact.filename,
          contractInterfaceArtifact.interfaceName,
          contractInterfaceArtifact.subdir
        )

        const testName =
          `${contractName} should have ERC-165 support for ` +
          `${contractInterfaceArtifact.interfaceName} (${info.interfaceId})`
        it(testName, async function () {
          // Read the artifact
          try {
            expect(
              await testRef.supportsInterface(info.interfaceId),
              `${JSON.stringify(info, null, 2)}\nInterface ID: ${info.interfaceId} (${info.interfaceName})`
            ).to.equal(true)
          } catch (e) {
            // log all the interface ids
            for (const contractInterfaceArtifact of INTERFACES_BY_CONTRACT_NAME[contractName]) {
              // Read the artifact
              try {
                const info: InterfaceERC165Info = readERC165Info(
                  contractInterfaceArtifact.filename,
                  contractInterfaceArtifact.interfaceName,
                  contractInterfaceArtifact.subdir
                )
                console.log(`Interface ID: ${info.interfaceId} (${info.interfaceName})`)
              } catch (e) {
                console.error(`Error reading interface info for ${contractInterfaceArtifact.interfaceName}`)
              }
            }
            console.log(e)
            throw e
          }
        })
      }
    })
  }

  testSuite('OpenAvatarGen0AssetsPaletteStore', async () => {
    testRef = openAvatarGen0AssetsPaletteStore
  })

  testSuite('OpenAvatarGen0AssetsCanvasStore', async () => {
    testRef = openAvatarGen0AssetsCanvasStore
  })

  testSuite('OpenAvatarGen0AssetsPatternStore', async () => {
    testRef = openAvatarGen0AssetsPatternStore
  })

  testSuite('OpenAvatarGen0Assets', async () => {
    testRef = openAvatarGen0Assets
  })

  testSuite('OpenAvatarGen0AssetsCanvasLayerCompositor', async () => {
    testRef = openAvatarGen0AssetsCanvasLayerCompositor
  })

  testSuite('OpenAvatarGen0CanvasRenderer', async () => {
    testRef = openAvatarGen0CanvasRenderer
  })

  testSuite('OpenAvatarGen0Renderer', async () => {
    testRef = openAvatarGen0Renderer
  })

  testSuite('OpenAvatarGen0RendererRegistry', async () => {
    testRef = openAvatarGen0RendererRegistry
  })

  testSuite('OpenAvatarGen0Token', async () => {
    testRef = openAvatarGen0Token
  })

  describe('OpenAvatarGen0Token ERC721 checks', function () {
    it('OpenAvatarGen0Token should have ERC-165 support for ERC721', async function () {
      // interfaceId == 0x80ac58cd || // ERC165 interface ID for ERC721.
      expect(await openAvatarGen0Token.supportsInterface('0x5b5e139f')).to.equal(true)
    })
    it('OpenAvatarGen0Token should have ERC-165 support for ERC721Metadata', async function () {
      // interfaceId == 0x5b5e139f; // ERC165 interface ID for ERC721Metadata.
      expect(await openAvatarGen0Token.supportsInterface('0x80ac58cd')).to.equal(true)
    })
  })

  testSuite('OpenAvatarGen0TextRecords', async () => {
    testRef = openAvatarGen0TextRecords
  })

  testSuite('OpenAvatarGen0ProfilePictureRenderer', async () => {
    testRef = openAvatarGen0ProfilePictureRenderer
  })
})
