import { providers } from 'ethers'
import { ERC165ContractWrapper } from '../../ERC165ContractWrapper'
import { GasParams } from '../../GasParams'

export type UploadPaletteInput = {
  code: number
  index: number
  palette: Buffer[]
}

export type UploadPaletteBatchInput = {
  code: number
  fromIndex: number
  palettes: Buffer[][]
}

export class OpenAvatarGen0AssetsPaletteStore extends ERC165ContractWrapper {
  async getNumPaletteCodes(): Promise<number> {
    return parseInt(await this._contract.getNumPaletteCodes())
  }

  async getNumPalettes(code: number): Promise<number> {
    return parseInt(await this._contract.getNumPalettes(code))
  }

  async getPalette(code: number, index: number): Promise<Buffer[]> {
    return await this._contract.getPalette(code, index)
  }

  async uploadPalette(
    code: number,
    index: number,
    palette: Buffer[],
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const params = { code, index, palette }
    const estimatedGas = await this._contract.estimateGas.uploadPalette(params)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.uploadPalette(params, txOptions)
  }

  async uploadPaletteBatch(
    code: number,
    fromIndex: number,
    palettes: Buffer[][],
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const params = { code, fromIndex, palettes }
    const estimatedGas = await this._contract.estimateGas.uploadPaletteBatch(params)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.uploadPaletteBatch(params, txOptions)
  }

  async uploadPaletteBatches(
    input: UploadPaletteBatchInput[],
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.uploadPaletteBatches(input)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.uploadPaletteBatches(input, txOptions)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  async burnFuseCanUploadPalette(): Promise<providers.TransactionResponse> {
    return await this.contract.burnFuseCanUploadPalette()
  }

  async isFuseBurnedCanUploadPalette(): Promise<boolean> {
    return await this.contract.isFuseBurnedCanUploadPalette()
  }
}
