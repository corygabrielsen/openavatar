import { DNA } from '@openavatar/types'
import { BigNumber, BigNumberish, providers } from 'ethers'
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

function validateNonEmpty<T>(array: T[]): T[] {
  if (array.length === 0) {
    throw new Error(`Empty array`)
  }
  return array
}

export class OpenAvatarGen0Token extends ERC165ContractWrapper {
  /////////////////////////////////////////////////////////////////////////////
  // Dependencies
  /////////////////////////////////////////////////////////////////////////////

  async getOpenAvatarGen0RendererRegistry(): Promise<string> {
    return await this._contract.getOpenAvatarGen0RendererRegistry()
  }

  async initialize(
    openAvatarGen0RendererRegistryAddress: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.initialize(openAvatarGen0RendererRegistryAddress)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.initialize(openAvatarGen0RendererRegistryAddress, txOptions)
  }

  /////////////////////////////////////////////////////////////////
  // ERC-721
  /////////////////////////////////////////////////////////////////

  async balanceOf(address: string): Promise<number> {
    return await this._contract.balanceOf(validateAddress(address))
  }

  async ownerOf(tokenId: number): Promise<string> {
    return await this._contract.ownerOf(validateTokenId(tokenId))
  }

  async tokenURI(tokenId: number): Promise<string> {
    return await this._contract.tokenURI(validateTokenId(tokenId))
  }

  async supplySoftCap(): Promise<number> {
    return parseInt(await this._contract.supplySoftCap())
  }

  async supplyHardCap(): Promise<number> {
    return parseInt(await this._contract.supplyHardCap())
  }

  async totalSupply(): Promise<number> {
    return parseInt(await this._contract.totalSupply())
  }

  async increaseSupplySoftCap(amount: number, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.increaseSupplySoftCap(amount)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.increaseSupplySoftCap(amount, txOptions)
  }

  /////////////////////////////////////////////////////////////////
  // Mint State Machine
  /////////////////////////////////////////////////////////////////

  public static readonly PUBLIC: number = 4
  public static readonly PUBLIC_PENDING_BLOCK_TIMESTAMP: number = 3
  public static readonly ONLY_OWNER = 2
  public static readonly DISABLED = 1
  public static readonly PERMANENTLY_DISABLED = 0

  async setMintState(val: number, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setMintState(val)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setMintState(val, txOptions)
  }

  async getMintPrice(): Promise<BigNumber> {
    return await this._contract.getMintPrice()
  }

  async setMintPrice(val: BigNumberish, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setMintPrice(val)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setMintPrice(val, txOptions)
  }

  async getPublicMintTime(): Promise<BigNumber> {
    return await this._contract.getPublicMintTime()
  }

  async setPublicMintTime(val: number | BigNumber, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setPublicMintTime(val)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setPublicMintTime(val, txOptions)
  }

  async getMintState(): Promise<number> {
    return this._contract.getMintState()
  }

  async isMintPublic(): Promise<boolean> {
    return await this._contract.isMintPublic()
  }

  async isMintPublicPendingBlockTimestamp(): Promise<boolean> {
    return await this._contract.isMintPublicPendingBlockTimestamp()
  }

  async isMintOnlyOwner(): Promise<boolean> {
    return await this._contract.isMintOnlyOwner()
  }

  async isMintDisabled(): Promise<boolean> {
    return await this._contract.isMintDisabled()
  }

  async isMintPermanentlyDisabled(): Promise<boolean> {
    return await this._contract.isMintPermanentlyDisabled()
  }

  /////////////////////////////////////////////////////////////////
  // Mint Helpers
  /////////////////////////////////////////////////////////////////

  async isMinted(dna: DNA): Promise<boolean> {
    if (dna.buffer === undefined) {
      throw new Error(`dna.buffer is undefined. dna: ${dna}`)
    }
    if (dna.buffer.length !== 32) {
      throw new Error(`dna.buffer is not 32 bytes. dna: ${dna}`)
    }
    return await this._contract.isMinted(dna.buffer)
  }

  // async canMint(address: string, dna: DNA) {
  //   return await this._contract.canMint(address, dna.buffer)
  // }

  /////////////////////////////////////////////////////////////////
  // Mint APIs
  /////////////////////////////////////////////////////////////////

  async mint(dna: DNA, args?: { value: BigNumber }): Promise<providers.TransactionResponse> {
    return await this._contract.mint(dna.buffer, args !== undefined ? args : { value: await this.getMintPrice() })
  }

  async mint__withGasParams(
    dna: DNA,
    gasParams: GasParams,
    args?: { value: BigNumber }
  ): Promise<providers.TransactionResponse> {
    const estimateGas = await this._contract.estimateGas.mint(
      dna.buffer,
      args !== undefined ? args : { value: await this.getMintPrice() }
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimateGas }
      : { gasLimit: estimateGas }
    if (args !== undefined) {
      txOptions.value = args.value
    }
    this.logGas(estimateGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.mint(dna.buffer, txOptions)
  }

  async mintTo(address: string, dna: DNA, args?: { value: BigNumber }): Promise<providers.TransactionResponse> {
    return await this._contract.mintTo(
      validateAddress(address),
      dna.buffer,
      args !== undefined ? args : { value: await this.getMintPrice() }
    )
  }

  async mintBatch(dnas: DNA[]): Promise<providers.TransactionResponse> {
    return await this._contract.mintBatch(
      validateNonEmpty(dnas).map((dna) => dna.buffer),
      { value: (await this.getMintPrice()).mul(dnas.length) }
    )
  }

  async mintBatch__withGasParams(
    dnas: DNA[],
    gasParams: GasParams,
    args?: { value: BigNumber }
  ): Promise<providers.TransactionResponse> {
    const params = validateNonEmpty(dnas).map((dna) => dna.buffer)
    const estimateGas = await this._contract.estimateGas.mintBatch(
      params,
      args !== undefined ? args : { value: await this.getMintPrice() }
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimateGas }
      : { gasLimit: estimateGas }
    if (args !== undefined) {
      txOptions.value = args.value
    }
    this.logGas(estimateGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.mintBatch(params, txOptions)
  }

  async mintBatchTo(address: string, dnas: DNA[]): Promise<providers.TransactionResponse> {
    return await this._contract.mintBatchTo(
      validateAddress(address),
      validateNonEmpty(dnas).map((dna) => dna.buffer),
      { value: (await this.getMintPrice()).mul(dnas.length) }
    )
  }

  /////////////////////////////////////////////////////////////////
  // IOpenAvatarGen0TokenMetadata
  /////////////////////////////////////////////////////////////////

  async openAvatarURI(dna: DNA): Promise<string> {
    return await this._contract.openAvatarURI(dna.buffer)
  }

  async getOpenAvatarGen0TokenMetadataByDNA(dna: DNA): Promise<any[]> {
    return await this._contract.getOpenAvatarGen0TokenMetadataByDNA(dna.buffer)
  }

  async getOpenAvatarGen0TokenMetadataByTokenId(tokenId: number): Promise<any[]> {
    return await this._contract.getOpenAvatarGen0TokenMetadataByTokenId(tokenId)
  }

  /////////////////////////////////////////////////////////////////
  // IOpenAvatarDNA
  /////////////////////////////////////////////////////////////////

  async getDNAByTokenId(tokenId: number): Promise<string> {
    return this._contract.getDNAByTokenId(validateTokenId(tokenId))
  }

  async getDNAsByTokenIds(tokenIds: number[]): Promise<string[]> {
    return this._contract.getDNAsByTokenIds(validateNonEmpty(tokenIds).map((tokenId) => validateTokenId(tokenId)))
  }

  async getTokenIdByDNA(dna: DNA): Promise<number> {
    if (dna.buffer === undefined) {
      throw new Error(`dna.buffer is undefined. dna: ${dna}`)
    }
    if (dna.buffer.length !== 32) {
      throw new Error(`dna.buffer is not 32 bytes. dna: ${dna}`)
    }
    return parseInt(await this._contract.getTokenIdByDNA(dna.buffer))
  }

  async getTokenIdsByDNAs(dnas: DNA[]): Promise<number[]> {
    return (await this._contract.getTokenIdsByDNAs(validateNonEmpty(dnas).map((dna) => dna.buffer))).map(
      (tokenId: BigNumber) => tokenId.toNumber()
    )
  }

  async creatorOf(tokenId: number): Promise<string> {
    return await this._contract.creatorOf(validateTokenId(tokenId))
  }

  async creatorOfDNA(dna: DNA): Promise<string> {
    return await this._contract.creatorOfDNA(dna.buffer)
  }

  async ownerOfDNA(dna: DNA): Promise<string> {
    return await this._contract.ownerOfDNA(dna.buffer)
  }

  async ownerOfDNAs(dnas: DNA[]): Promise<string> {
    return await this._contract.ownerOfDNAs(validateNonEmpty(dnas).map((dna) => dna.buffer))
  }

  /////////////////////////////////////////////////////////////////
  // Fuse - Can Increase Supply Soft Cap
  /////////////////////////////////////////////////////////////////

  async burnFuseCanIncreaseSupplySoftCap(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanIncreaseSupplySoftCap()
  }

  async isFuseBurnedCanIncreaseSupplySoftCap(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanIncreaseSupplySoftCap()
  }

  /////////////////////////////////////////////////////////////////
  // Fuse - Can Change Mint State
  /////////////////////////////////////////////////////////////////

  async burnFuseCanChangeMintState(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanChangeMintState()
  }

  async isFuseBurnedCanChangeMintState(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanChangeMintState()
  }

  /////////////////////////////////////////////////////////////////
  // Fuse - Can Lower Public Mint Price
  /////////////////////////////////////////////////////////////////

  async burnFuseCanLowerMintPrice(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanLowerMintPrice()
  }

  async isFuseBurnedCanLowerMintPrice(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanLowerMintPrice()
  }

  /////////////////////////////////////////////////////////////////
  // Fuses - Can Raise Public Mint Price
  /////////////////////////////////////////////////////////////////

  async burnFuseCanRaiseMintPrice(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanRaiseMintPrice()
  }

  async isFuseBurnedCanRaiseMintPrice(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanRaiseMintPrice()
  }

  /////////////////////////////////////////////////////////////////
  // Fuse - Can Change Public Mint Time
  /////////////////////////////////////////////////////////////////

  async burnFuseCanChangePublicMintTime(): Promise<providers.TransactionResponse> {
    return await this._contract.burnFuseCanChangePublicMintTime()
  }

  async isFuseBurnedCanChangePublicMintTime(): Promise<boolean> {
    return await this._contract.isFuseBurnedCanChangePublicMintTime()
  }

  /////////////////////////////////////////////////////////////////
  // Treasury
  /////////////////////////////////////////////////////////////////

  async withdraw(amount: BigNumberish, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.withdraw(amount)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.withdraw(amount)
  }
}
