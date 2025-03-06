import { providers } from 'ethers'
import { ERC165ContractWrapper } from '../../ERC165ContractWrapper'
import { GasParams } from '../../GasParams'

export type CanvasHeader = {
  id: number
  width: number
  height: number
}

export interface IOpenAvatarGen0AssetsCanvasStore {
  addCanvas(header: CanvasHeader): Promise<providers.TransactionResponse>

  hasCanvas(id: number): Promise<boolean>

  getCanvasHeader(id: number): Promise<{ width: number; height: number }>

  getCanvasIds(): Promise<number[]>

  getNumCanvasIds(): Promise<number>

  getCanvasWidth(id: number): Promise<number>

  getCanvasHeight(id: number): Promise<number>

  getCanvasNumPixels(id: number): Promise<number>

  getCanvasNumBytes(id: number): Promise<number>
}

export class OpenAvatarGen0AssetsCanvasStore extends ERC165ContractWrapper implements IOpenAvatarGen0AssetsCanvasStore {
  /////////////////////////////////////////////////////////////////////////////
  // Canvas
  /////////////////////////////////////////////////////////////////////////////
  async addCanvas(header: CanvasHeader, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.addCanvas(header)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this.contract.addCanvas(header, txOptions)
  }

  async hasCanvas(id: number): Promise<boolean> {
    return await this.contract.hasCanvas(id)
  }

  async getCanvasHeader(id: number): Promise<CanvasHeader> {
    const [canvasId, width, height] = await this.contract.getCanvasHeader(id)
    return {
      id: canvasId,
      width: width,
      height: height,
    }
  }

  async getNumCanvasIds(): Promise<number> {
    return parseInt(await this.contract.getNumCanvasIds())
  }

  async getCanvasIds(): Promise<number[]> {
    return await this.contract.getCanvasIds()
  }

  async getCanvasWidth(id: number): Promise<number> {
    return parseInt(await this.contract.getCanvasWidth(id))
  }

  async getCanvasHeight(id: number): Promise<number> {
    return parseInt(await this.contract.getCanvasHeight(id))
  }

  async getCanvasNumPixels(id: number): Promise<number> {
    return parseInt(await this.contract.getCanvasNumPixels(id))
  }

  async getCanvasNumBytes(id: number): Promise<number> {
    return parseInt(await this.contract.getCanvasNumBytes(id))
  }

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  async burnFuseCanAddCanvas(): Promise<providers.TransactionResponse> {
    return await this.contract.burnFuseCanAddCanvas()
  }

  async isFuseBurnedCanAddCanvas(): Promise<boolean> {
    return await this.contract.isFuseBurnedCanAddCanvas()
  }
}
