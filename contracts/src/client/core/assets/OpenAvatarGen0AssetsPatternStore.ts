import { PatternHeader } from '@openavatar/assets'
import { Contract, providers, utils } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { GasParams } from '../../GasParams'
import {
  CanvasHeader,
  IOpenAvatarGen0AssetsCanvasStore,
  OpenAvatarGen0AssetsCanvasStore,
} from './OpenAvatarGen0AssetsCanvasStore'
import { OpenAvatarGen0AssetsPaletteStore } from './OpenAvatarGen0AssetsPaletteStore'

export type UploadPatternInput = {
  canvasId: number
  layer: number
  index: number
  // header
  width: number
  height: number
  offsetX: number
  offsetY: number
  paletteCode: number
  // data
  data: Buffer | Uint8Array
}

export type OptionalPatternHeader = {
  exists: boolean
  header: PatternHeader
}

interface Config {
  logging: boolean
}
const DEFAULT_ON = true

export class OpenAvatarGen0AssetsPatternStore
  extends OpenAvatarGen0AssetsPaletteStore
  implements IOpenAvatarGen0AssetsCanvasStore
{
  private readonly _canvasInterface: OpenAvatarGen0AssetsCanvasStore

  constructor(hre: HardhatRuntimeEnvironment, contract: Contract, config: Config = { logging: DEFAULT_ON }) {
    super(hre, contract, config)
    this._canvasInterface = new OpenAvatarGen0AssetsCanvasStore(hre, contract)
  }

  /********************************************************************************
   * Canvas
   ********************************************************************************/

  addCanvas(header: CanvasHeader): Promise<providers.TransactionResponse> {
    return this._canvasInterface.addCanvas(header)
  }
  hasCanvas(id: number): Promise<boolean> {
    return this._canvasInterface.hasCanvas(id)
  }
  getCanvasHeader(id: number): Promise<CanvasHeader> {
    return this._canvasInterface.getCanvasHeader(id)
  }
  getCanvasIds(): Promise<number[]> {
    return this._canvasInterface.getCanvasIds()
  }
  getNumCanvasIds(): Promise<number> {
    return this._canvasInterface.getNumCanvasIds()
  }
  getCanvasWidth(id: number): Promise<number> {
    return this._canvasInterface.getCanvasWidth(id)
  }
  getCanvasHeight(id: number): Promise<number> {
    return this._canvasInterface.getCanvasHeight(id)
  }
  getCanvasNumPixels(id: number): Promise<number> {
    return this._canvasInterface.getCanvasNumPixels(id)
  }
  getCanvasNumBytes(id: number): Promise<number> {
    return this._canvasInterface.getCanvasNumBytes(id)
  }

  /********************************************************************************
   * Layers
   ********************************************************************************/

  async getNumLayers(canvasId: number): Promise<number> {
    return parseInt(await this._contract.getNumLayers(canvasId))
  }

  async addLayer(canvasId: number, layer: number, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.addLayer(canvasId, layer)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return this._contract.addLayer(canvasId, layer, txOptions)
  }

  async addLayers(canvasId: number, layers: number[], gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.addLayers(canvasId, layers)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return this._contract.addLayers(canvasId, layers, txOptions)
  }

  /********************************************************************************
   * Patterns
   ********************************************************************************/

  async getNumPatterns(canvasId: number, layer: number): Promise<number> {
    return parseInt(await this._contract.getNumPatterns(canvasId, layer))
  }

  async getPatternHeader(canvasId: number, layer: number, index: number): Promise<OptionalPatternHeader> {
    const result = await this._contract.getPatternHeader(canvasId, layer, index)
    return {
      exists: result.exists,
      header: {
        width: result.header.width,
        height: result.header.height,
        offsetX: result.header.offsetX,
        offsetY: result.header.offsetY,
        paletteCode: result.header.paletteCode,
      },
    }
  }

  async getPatternData(canvasId: number, layer: number, index: number): Promise<Uint8Array> {
    const data: string = await this._contract.getPatternData(canvasId, layer, index)
    return new Uint8Array(utils.arrayify(data))
  }

  async uploadPattern(input: UploadPatternInput, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.uploadPattern(input)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.uploadPattern(input, txOptions)
  }

  async uploadPatterns(inputs: UploadPatternInput[], gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.uploadPatterns(inputs)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.uploadPatterns(inputs, txOptions)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  async burnFuseCanAddLayer(): Promise<providers.TransactionResponse> {
    return await this.contract.burnFuseCanAddLayer()
  }

  async isFuseBurnedCanAddLayer(): Promise<boolean> {
    return await this.contract.isFuseBurnedCanAddLayer()
  }

  async burnFuseCanUploadPattern(): Promise<providers.TransactionResponse> {
    return await this.contract.burnFuseCanUploadPattern()
  }

  async isFuseBurnedCanUploadPattern(): Promise<boolean> {
    return await this.contract.isFuseBurnedCanUploadPattern()
  }
}
