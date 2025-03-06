import { DNA } from '@openavatar/types'
import { providers } from 'ethers'
import { ERC165ContractWrapper } from './ERC165ContractWrapper'
import { GasParams } from './GasParams'

function validateTokenId(tokenId: number): number {
  // ensure non-negative integer
  if (tokenId < 0) {
    throw new Error(`tokenId must be non-negative`)
  }
  if (parseInt(tokenId.toString()) !== tokenId) {
    throw new Error(`tokenId must be an integer`)
  }
  return tokenId
}

function validateAddress(address: string): string {
  if (!address.startsWith('0x')) {
    throw new Error(`address must start with 0x`)
  }
  return address
}

export class OpenAvatarGen0RendererRegistry extends ERC165ContractWrapper {
  /////////////////////////////////////////////////////////////////////////////
  // Dependencies
  /////////////////////////////////////////////////////////////////////////////

  async getOpenAvatarGen0TextRecords(): Promise<string> {
    return await this._contract.getOpenAvatarGen0TextRecords()
  }

  async initialize(
    openAvatarGen0TextRecordsAddress: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.initialize(openAvatarGen0TextRecordsAddress)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.initialize(openAvatarGen0TextRecordsAddress, txOptions)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Default
  /////////////////////////////////////////////////////////////////////////////

  async getDefaultRenderer(): Promise<string> {
    return await this._contract.getDefaultRenderer()
  }

  async setDefaultRendererByKey(key: string, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setDefaultRendererByKey(key)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setDefaultRendererByKey(key, txOptions)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Read
  /////////////////////////////////////////////////////////////////////////////

  async getNumRenderers(): Promise<number> {
    return (await this._contract.getNumRenderers()).toNumber()
  }

  async getNumRendererKeys(): Promise<string[]> {
    return await this._contract.getRendererKeys()
  }

  async getRendererByKey(key: string): Promise<string> {
    return await this._contract.getRendererByKey(key)
  }

  async getRendererByDNA(dna: DNA): Promise<string> {
    return await this._contract.getRendererByDNA(dna.buffer)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Write
  /////////////////////////////////////////////////////////////////////////////

  async addRenderer(key: string, address: string, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    address = validateAddress(address)
    const estimatedGas = await this._contract.estimateGas.addRenderer(key, address)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.addRenderer(key, address, txOptions)
  }

  /////////////////////////////////////////////////////////////////
  // Fuse - Can Add Renderer
  /////////////////////////////////////////////////////////////////

  async burnFuseCanAddRenderer(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanAddRenderer()
  }

  async isFuseBurnedCanAddRenderer(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanAddRenderer()
  }
}
