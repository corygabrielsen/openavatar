import { DNA } from '@openavatar/types'
import { providers } from 'ethers'
import { ERC165ContractWrapper } from './ERC165ContractWrapper'
import { GasParams } from './GasParams'

type TextRecord = {
  key: string
  value: string
}

type DNATextRecord = {
  dna: DNA
  key: string
  value: string
}

export class OpenAvatarGen0TextRecords extends ERC165ContractWrapper {
  async text(dna: DNA, key: string): Promise<string> {
    return await this._contract.text(dna.buffer, key)
  }

  async getOpenAvatarGen0Token(): Promise<string> {
    return await this._contract.getOpenAvatarGen0Token()
  }

  async initialize(openAvatarGen0TokenAddress: string, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.initialize(openAvatarGen0TokenAddress)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.initialize(openAvatarGen0TokenAddress, txOptions)
  }

  async setText(dna: DNA, key: string, value: string, gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setText(dna.buffer, key, value)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setText(dna.buffer, key, value, txOptions)
  }

  async setTexts(dna: DNA, records: TextRecord[], gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setTexts(
      dna.buffer,
      records.map((r) => [r.key, r.value])
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setTexts(
      dna.buffer,
      records.map((r) => [r.key, r.value]),
      txOptions
    )
  }

  async setTextBatch(dnaTextRecords: DNATextRecord[], gasParams?: GasParams): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setTextBatch(
      dnaTextRecords.map((r) => [r.dna.buffer, r.key, r.value])
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setTextBatch(
      dnaTextRecords.map((r) => [r.dna.buffer, r.key, r.value]),
      txOptions
    )
  }

  async setText2(
    dna: DNA,
    key: string,
    value: string,
    key2: string,
    value2: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setText2(dna.buffer, key, value, key2, value2)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setText2(dna.buffer, key, value, key2, value2, txOptions)
  }

  async setText3(
    dna: DNA,
    key: string,
    value: string,
    key2: string,
    value2: string,
    key3: string,
    value3: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setText3(dna.buffer, key, value, key2, value2, key3, value3)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setText3(dna.buffer, key, value, key2, value2, key3, value3, txOptions)
  }

  async setText4(
    dna: DNA,
    key: string,
    value: string,
    key2: string,
    value2: string,
    key3: string,
    value3: string,
    key4: string,
    value4: string,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.setText4(
      dna.buffer,
      key,
      value,
      key2,
      value2,
      key3,
      value3,
      key4,
      value4
    )
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.setText4(dna.buffer, key, value, key2, value2, key3, value3, key4, value4, txOptions)
  }
}
