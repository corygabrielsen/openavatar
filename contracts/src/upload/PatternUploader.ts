import { BigNumber, PopulatedTransaction, providers } from 'ethers'
import { OpenAvatarGen0Assets } from '../client/OpenAvatarGen0Assets'
import { UploadPatternInput } from '../client/core/assets/OpenAvatarGen0AssetsPatternStore'

import { AvatarDefinitions, AvatarLayerStack, AvatarPose, LayerDescriptor, PatternDescriptor } from '@openavatar/types'

import { AvatarAssets, PatternBlob, PatternMaster, PatternPose } from '@openavatar/assets'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { GasParams } from '../client/GasParams'
import { confirmIfPublicDeployment } from '../util/NetworkUtils'
import { fmtCommas } from '../util/StringUtils'

const GREEN = '\x1b[32m'
const END = '\x1b[0m'

interface Config {
  logging: boolean
}

export type PatternUploadTx = {
  canvasId: number
  pattern: PatternDescriptor
  tx: providers.TransactionResponse
  receipt: providers.TransactionReceipt
}

// Define the observer (consumer)
export interface PatternUploadObserver {
  update(data: { receipt: providers.TransactionReceipt }): void
}

function fmt3Wide(n: number): string {
  return n.toString().padStart(3, ' ')
}

/**
 * Uploads pattern files to the {@link OpenAvatarGen0Assets} contract.
 */
export class PatternUploader {
  private _observers: PatternUploadObserver[] = []
  private readonly gasParams: GasParams
  private readonly console: {
    debug: (...args: any[]) => void
    error: (...args: any[]) => void
    log: (...args: any[]) => void
    warn: (...args: any[]) => void
  }
  constructor(
    public readonly hre: HardhatRuntimeEnvironment,
    public readonly openAvatarGen0Assets: OpenAvatarGen0Assets,
    gasParams: GasParams,
    config: Config = { logging: true }
  ) {
    this.gasParams = gasParams
    this.console = config.logging ? console : { debug: () => {}, error: () => {}, log: () => {}, warn: () => {} }
    // should have contract that is not undefined
    if (!this.openAvatarGen0Assets.contract) {
      throw new Error('PatternUploader: contract is undefined')
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // Observer pattern to notify when an upload is complete
  ////////////////////////////////////////////////////////////////////////////

  subscribe(observer: PatternUploadObserver): void {
    this._observers.push(observer)
  }

  unsubscribe(observer: PatternUploadObserver): void {
    this._observers = this._observers.filter((obs) => obs !== observer)
  }

  notify(data: PatternUploadTx): void {
    this.console.log(
      `\tUploaded\t(${fmt3Wide(data.canvasId)}, ${fmt3Wide(data.pattern.layer.index)}, ${fmt3Wide(
        data.pattern.index
      )})   \t${data.pattern.layer.name}__${data.pattern.name}`
    )
    this._observers.forEach((observer) => observer.update(data))
  }

  ////////////////////////////////////////////////////////////////////////////
  // Getter wrappers
  ////////////////////////////////////////////////////////////////////////////

  /**
   * Gets the number of patterns for a layer.
   * @param canvasId The canvas.
   * @param layer The layer.
   * @returns The number of patterns.
   */
  getNumPatterns(canvasId: number, layer: LayerDescriptor): Promise<number> {
    return this.openAvatarGen0Assets.getNumPatterns(canvasId, layer.index)
  }

  ////////////////////////////////////////////////////////////////////////////
  // Upload Pattern APIs
  ////////////////////////////////////////////////////////////////////////////

  /**
   * Uploads a pattern to the contract.
   * @param pattern The pattern to upload.
   * @returns The transaction response.
   */
  async uploadPattern(pattern: PatternDescriptor, pose: AvatarPose): Promise<providers.TransactionResponse> {
    const input: UploadPatternInput = await this.getUploadPatternInput(pattern, pose)
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx: providers.TransactionResponse = await this.openAvatarGen0Assets.uploadPattern(input, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    tx.wait().then((receipt: providers.TransactionReceipt) => {
      this.notify({ canvasId: input.canvasId, pattern, tx, receipt })
    })

    return tx
  }

  async getUploadPatternInputsByLayer(layer: LayerDescriptor, pose: AvatarPose): Promise<UploadPatternInput[]> {
    const availablePatterns: PatternDescriptor[] = AvatarDefinitions.getPatternsByLayer(layer)
    this.console.log(`Found ${availablePatterns.length} patterns available to upload for layer: ${layer.name}.`)
    const numPatternsAlreadyUploaded: number = await this.openAvatarGen0Assets.getNumPatterns(
      pose.canvasId,
      layer.index
    )
    const patterns: PatternDescriptor[] = availablePatterns.filter(
      (pattern) => pattern.index >= numPatternsAlreadyUploaded
    )
    if (numPatternsAlreadyUploaded > 0) {
      this.console.log(`\tSkipping ${numPatternsAlreadyUploaded} patterns already uploaded.`)
    }
    const uploadPatternInputs: UploadPatternInput[] = []
    for (const pattern of patterns) {
      uploadPatternInputs.push(await this.getUploadPatternInput(pattern, pose))
    }
    return uploadPatternInputs
  }

  async batchUploadPatternInputsByGasEstimate(
    uploadPatternInputs: UploadPatternInput[],
    gasLimit: number
  ): Promise<UploadPatternInput[][]> {
    const batches: UploadPatternInput[][] = []
    let batch: UploadPatternInput[] = []
    let gasEstimate = BigNumber.from(0)

    this.console.log(`Total patterns to upload: ${uploadPatternInputs.length}`)
    for (const uploadPatternInput of uploadPatternInputs) {
      const tempBatch = [...batch, uploadPatternInput]
      const transaction: PopulatedTransaction =
        await this.openAvatarGen0Assets.contract.populateTransaction.uploadPatterns(tempBatch)

      let tempGasEstimate: BigNumber = BigNumber.from(0)
      try {
        tempGasEstimate = await this.openAvatarGen0Assets.contract.provider.estimateGas(transaction)
      } catch (e) {
        console.error('tempGasEstimate Error estimating gas for batch.')
        console.error('tempGasEstimate Batch size: ', tempBatch.length)
        console.error('tempGasEstimate Batch: ', tempBatch)
        throw e
      }

      if (tempGasEstimate.gt(gasLimit)) {
        // Push the current batch and start a new batch with the current input
        batches.push(batch)
        batch = [uploadPatternInput]
        // Reset the gas estimate for the new batch
        const newTransaction: PopulatedTransaction =
          await this.openAvatarGen0Assets.contract.populateTransaction.uploadPatterns(batch)
        try {
          gasEstimate = await this.openAvatarGen0Assets.contract.provider.estimateGas(newTransaction)
        } catch (e) {
          console.error('gasEstimate Error estimating gas for batch.')
          console.error('gasEstimate Batch size: ', batch.length)
          console.error('gasEstimate Batch: ', batch)
          throw e
        }
      } else {
        // Add to batch
        this.console.log(
          `${GREEN}    size ${tempBatch.length} batch has gas estimate ${fmtCommas(tempGasEstimate.toNumber())}${END}`
        )
        batch = tempBatch
        gasEstimate = tempGasEstimate
      }
    }

    // Add the remaining batch if it's not empty
    if (batch.length > 0) {
      batches.push(batch)
    }

    return batches
  }

  async nextBatch(uploadPatternInputs: UploadPatternInput[], gasLimit: number): Promise<UploadPatternInput[]> {
    let batch: UploadPatternInput[] = []
    let gasEstimate = BigNumber.from(0)

    this.console.log(`Total patterns to upload: ${uploadPatternInputs.length}`)
    for (const uploadPatternInput of uploadPatternInputs) {
      const tempBatch = [...batch, uploadPatternInput]
      const transaction: PopulatedTransaction =
        await this.openAvatarGen0Assets.contract.populateTransaction.uploadPatterns(tempBatch)

      let tempGasEstimate: BigNumber = BigNumber.from(0)
      try {
        tempGasEstimate = await this.openAvatarGen0Assets.contract.provider.estimateGas(transaction)
      } catch (e) {
        console.error('tempGasEstimate Error estimating gas for batch.')
        console.error('tempGasEstimate Batch size: ', tempBatch.length)
        console.error('tempGasEstimate Batch: ', tempBatch)
        throw e
      }

      if (tempGasEstimate.gt(gasLimit)) {
        // Return the current batch if next item causes the batch to exceed the gas limit
        return batch
      } else {
        // Add to batch
        this.console.log(
          `${GREEN}    size ${tempBatch.length} batch has gas estimate ${fmtCommas(tempGasEstimate.toNumber())}${END}`
        )
        batch = tempBatch
        gasEstimate = tempGasEstimate
      }
    }

    // Return the last batch if it's not empty
    return batch
  }

  async processAndUploadBatch(batch: UploadPatternInput[]): Promise<providers.TransactionResponse> {
    this.console.log(`Uploading batch with ${batch.length} patterns`)
    const populateTransaction: PopulatedTransaction =
      await this.openAvatarGen0Assets.contract.populateTransaction.uploadPatterns(batch)
    let gasEstimate: BigNumber = BigNumber.from(0)
    try {
      gasEstimate = await this.openAvatarGen0Assets.contract.provider.estimateGas(populateTransaction)
    } catch (e) {
      console.error('processBatches Error estimating gas for batch.')
      console.error('processBatches Batch size: ', batch.length)
      console.error('processBatches Batch: ', batch)
      throw e
    }
    this.console.log(`  gas estimate: ${fmtCommas(gasEstimate.toNumber())}`)
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx: providers.TransactionResponse = await this.openAvatarGen0Assets.uploadPatterns(batch, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    const receipt: providers.TransactionReceipt = await tx.wait()
    this.console.log(`Uploaded batch with ${batch.length} patterns using ${fmtCommas(receipt.gasUsed.toNumber())} gas`)
    return tx
  }

  async uploadAll(pose: AvatarPose, gasLimit: number = 15_000_000): Promise<providers.TransactionResponse[]> {
    const allUploadPatternInputs: UploadPatternInput[] = []
    for (const layer of AvatarLayerStack.iter()) {
      const uploadPatternInputs: UploadPatternInput[] = await this.getUploadPatternInputsByLayer(layer, pose)
      allUploadPatternInputs.push(...uploadPatternInputs)
    }

    const responses: providers.TransactionResponse[] = []
    while (allUploadPatternInputs.length > 0) {
      const batch: UploadPatternInput[] = await this.nextBatch(allUploadPatternInputs, gasLimit)
      responses.push(await this.processAndUploadBatch(batch))

      // Remove the processed patterns from the main list
      allUploadPatternInputs.splice(0, batch.length)
    }

    return responses
  }

  async getUploadPatternInput(pattern: PatternDescriptor, pose: AvatarPose): Promise<UploadPatternInput> {
    const patternMaster: PatternMaster = AvatarAssets.getPattern(pattern)
    const patternPose: PatternPose = patternMaster.cropPose(pose)

    // sanity check - make sure the pattern is not all zeroes
    const isAllZeroes: boolean = patternPose.buffer.every((b) => b === 0)
    if (isAllZeroes) {
      const msg = `${pose.name}__${pattern.layer.name}__${pattern.name} is all zeroes`
      if (pose === AvatarPose.IdleDown0) {
        throw new Error(msg)
      } else {
        this.console.warn('\t' + msg)
      }
    }

    const blob: PatternBlob = patternPose.trim()
    const input: UploadPatternInput = {
      canvasId: pose.canvasId,
      layer: pattern.layer.index,
      index: pattern.index,
      // header
      width: blob.header.width,
      height: blob.header.height,
      offsetX: blob.header.offsetX,
      offsetY: blob.header.offsetY,
      paletteCode: blob.header.paletteCode,
      // data
      data: blob.data,
    }

    return input
  }

  ////////////////////////////////////////////////////////////////////////////
  // Tests
  ////////////////////////////////////////////////////////////////////////////

  async batchUploadPatternInputsByN(
    uploadPatternInputs: UploadPatternInput[],
    n: number
  ): Promise<UploadPatternInput[][]> {
    const batches: UploadPatternInput[][] = []
    let batch: UploadPatternInput[] = []

    for (const uploadPatternInput of uploadPatternInputs) {
      const tempBatch = [...batch, uploadPatternInput]
      if (tempBatch.length > n) {
        // Push the current batch and start a new batch with the current input
        batches.push(batch)
        batch = [uploadPatternInput]
      } else {
        // Add to batch
        batch = tempBatch
      }
    }

    // Add the remaining batch if it's not empty
    if (batch.length > 0) {
      batches.push(batch)
    }

    return batches
  }

  /**
   * Uploads the all the patterns.
   * @returns The transaction response.
   */
  async uploadAllTestOnly(pose: AvatarPose): Promise<providers.TransactionResponse[]> {
    const allUploadPatternInputs: UploadPatternInput[] = []
    for (const layer of AvatarLayerStack.iter()) {
      const uploadPatternInputs: UploadPatternInput[] = await this.getUploadPatternInputsByLayer(layer, pose)
      allUploadPatternInputs.push(...uploadPatternInputs)
    }

    const responses: providers.TransactionResponse[] = []
    while (allUploadPatternInputs.length > 0) {
      const batch: UploadPatternInput[] = allUploadPatternInputs.slice(0, 100)
      responses.push(await this.processAndUploadBatch(batch))

      // Remove the processed patterns from the main list
      allUploadPatternInputs.splice(0, batch.length)
    }

    return responses
  }
}
