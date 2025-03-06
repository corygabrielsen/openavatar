import { providers } from 'ethers'
import { ContractWrapper } from './ContractWrapper'
import { GasParams } from './GasParams'

export class ERC165ContractWrapper extends ContractWrapper {
  async supportsInterface(interfaceID: string): Promise<boolean> {
    return await this.contract.supportsInterface(interfaceID)
  }

  async claimReverseENS(
    ens: `0x${string}`,
    claimant: `0x${string}`,
    gasParams?: GasParams
  ): Promise<providers.TransactionResponse> {
    const estimatedGas = await this._contract.estimateGas.claimReverseENS(ens, claimant)
    const txOptions: Record<string, any> = gasParams
      ? { ...gasParams, gasLimit: estimatedGas }
      : { gasLimit: estimatedGas }
    this.logGas(estimatedGas, txOptions)
    await this.confirmIfPublicDeployment()
    return await this._contract.claimReverseENS(ens, claimant, txOptions)
  }
}
