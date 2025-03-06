import { DNA } from '@openavatar/types'
import { providers } from 'ethers'
import { ERC165ContractWrapper } from '../../ERC165ContractWrapper'
import { GasParams } from '../../GasParams'

export class OpenAvatarGen0AssetsCanvasLayerCompositor extends ERC165ContractWrapper {
  async getOpenAvatarGen0Assets(): Promise<string> {
    return await this._contract.getOpenAvatarGen0Assets()
  }

  async initialize(openAvatarGen0AssetsAddress: string, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.initialize(openAvatarGen0AssetsAddress)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.initialize(openAvatarGen0AssetsAddress, txOptions)
  }

  async compose(dna: DNA): Promise<string> {
    return await this._contract.compose(dna)
  }

  async overlayCompose(buffer: Buffer, dna: DNA): Promise<string> {
    return await this._contract.overlayCompose(buffer, dna)
  }
}
