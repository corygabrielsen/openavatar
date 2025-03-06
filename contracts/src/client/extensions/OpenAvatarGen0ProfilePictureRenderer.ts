import { DNA } from '@openavatar/types'
import { providers } from 'ethers'
import { ERC165ContractWrapper } from '../ERC165ContractWrapper'
import { GasParams } from '../GasParams'

export type OpenAvatarProfilePictureSettings = {
  overrideBackground: boolean
  backgroundColor: `#${string}`
  maskBelowTheNeck: boolean
}

export class OpenAvatarGen0ProfilePictureRenderer extends ERC165ContractWrapper {
  /////////////////////////////////////////////////////////////////////////////
  // Dependencies
  /////////////////////////////////////////////////////////////////////////////

  async initialize(
    openAvatarGen0AssetsAddress: string,
    openAvatarGen0RendererAddress: string,
    openAvatarGen0TokenAddress: string,
    openAvatarGen0TextRecordsAddress: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.initialize(
      openAvatarGen0AssetsAddress,
      openAvatarGen0RendererAddress,
      openAvatarGen0TokenAddress,
      openAvatarGen0TextRecordsAddress
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.initialize(
      openAvatarGen0AssetsAddress,
      openAvatarGen0RendererAddress,
      openAvatarGen0TokenAddress,
      openAvatarGen0TextRecordsAddress,
      txOptions
    )
  }

  async isInitialized(): Promise<boolean> {
    return await this._contract.isInitialized()
  }

  async getOpenAvatarGen0Assets(): Promise<string> {
    return this._contract.getOpenAvatarGen0Assets()
  }

  async getOpenAvatarGen0AssetsCanvasLayerCompositor(): Promise<string> {
    return this._contract.getOpenAvatarGen0AssetsCanvasLayerCompositor()
  }

  async getOpenAvatarGen0Token(): Promise<string> {
    return this._contract.getOpenAvatarGen0Token()
  }

  async getOpenAvatarGen0TextRecords(): Promise<string> {
    return this._contract.getOpenAvatarGen0TextRecords()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Fuses
  /////////////////////////////////////////////////////////////////////////////

  async getFuseBurnedChangeBackgroundImage(): Promise<boolean> {
    return await this._contract.getFuseBurnedChangeBackgroundImage()
  }

  async burnFuseChangeBackgroundImage(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseChangeBackgroundImage()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Background Image
  /////////////////////////////////////////////////////////////////////////////

  async getDefaultBackgroundImage(): Promise<`0x${string}`> {
    return await this._contract.getDefaultBackgroundImage()
  }

  /////////////////////////////////////////////////////////////////////////////
  // renderURI
  /////////////////////////////////////////////////////////////////////////////

  async renderURI(dna: { buffer: Buffer }): Promise<string> {
    return await this._contract.renderURI(dna.buffer)
  }

  /////////////////////////////////////////////////////////////////////////////
  // Profile Picture Settings
  /////////////////////////////////////////////////////////////////////////////

  async getProfilePictureSettings(dna: DNA): Promise<OpenAvatarProfilePictureSettings> {
    const [overrideBackground, backgroundColor, maskBelowTheNeck] = await this._contract.getProfilePictureSettings(
      dna.buffer
    )
    return {
      overrideBackground,
      backgroundColor: `#${backgroundColor.slice('0x'.length)}`,
      maskBelowTheNeck,
    }
  }
}
