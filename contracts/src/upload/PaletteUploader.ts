import { AvatarAssets, Palette } from '@openavatar/assets'
import { AvatarDefinitions, PaletteDescriptor } from '@openavatar/types'
import { BigNumber, Contract, PopulatedTransaction, providers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { GasParams } from '../client/GasParams'
import {
  OpenAvatarGen0AssetsPaletteStore,
  UploadPaletteBatchInput,
} from '../client/core/assets/OpenAvatarGen0AssetsPaletteStore'
import { confirmIfPublicDeployment } from '../util/NetworkUtils'
import { fmtCommas } from '../util/StringUtils'

interface Config {
  logging: boolean
}

export type PaletteUploadTx = {
  palette: PaletteDescriptor
  tx: providers.TransactionResponse
  receipt: providers.TransactionReceipt
}

export type PaletteBatchUploadTx = {
  palettes: PaletteDescriptor[]
  tx: providers.TransactionResponse
  receipt: providers.TransactionReceipt
}

// Define the observer (consumer)
export interface PaletteUploadObserver {
  update(data: { receipt: providers.TransactionReceipt }): void
}

function fmt3Wide(n: number): string {
  return n.toString().padStart(3, ' ')
}

interface UploadPaletteBatchInputsWithGasEstimate {
  uploadPaletteBatchInputs: UploadPaletteBatchInput[]
  gasEstimate: BigNumber
}

/**
 * Uploads palette files to the {@link OpenAvatarGen0AssetsPaletteStore} contract.
 */
export class PaletteUploader {
  private _observers: PaletteUploadObserver[] = []
  public readonly paletteStore: OpenAvatarGen0AssetsPaletteStore
  private readonly gasParams: GasParams
  private readonly console: {
    debug: (...args: any[]) => void
    error: (...args: any[]) => void
    log: (...args: any[]) => void
    warn: (...args: any[]) => void
  }
  constructor(
    public readonly hre: HardhatRuntimeEnvironment,
    paletteStore: OpenAvatarGen0AssetsPaletteStore | Contract,
    gasParams: GasParams,
    config: Config = { logging: true }
  ) {
    this.paletteStore =
      paletteStore instanceof OpenAvatarGen0AssetsPaletteStore
        ? paletteStore
        : new OpenAvatarGen0AssetsPaletteStore(hre, paletteStore)
    this.gasParams = gasParams
    this.console = config.logging ? console : { debug: () => {}, error: () => {}, log: () => {}, warn: () => {} }
  }

  ////////////////////////////////////////////////////////////////////////////
  // Observer pattern to notify when an upload is complete
  ////////////////////////////////////////////////////////////////////////////

  subscribe(observer: PaletteUploadObserver): void {
    this._observers.push(observer)
  }

  unsubscribe(observer: PaletteUploadObserver): void {
    this._observers = this._observers.filter((obs) => obs !== observer)
  }

  notify(data: PaletteUploadTx): void {
    this.console.log(
      `\tUploaded\t(${fmt3Wide(data.palette.code)}, ${fmt3Wide(data.palette.index)})   \t${fmt3Wide(
        data.palette.code
      )}, ${data.palette.name})`
    )
    this._observers.forEach((observer) => observer.update(data))
  }

  notifyBatch(data: PaletteBatchUploadTx): void {
    for (const palette of data.palettes) {
      this.console.log(
        `\tUploaded\t(${fmt3Wide(palette.code)}, ${fmt3Wide(palette.index)})   \t(${fmt3Wide(palette.code)}, ${
          palette.name
        })`
      )
    }
    this._observers.forEach((observer) => observer.update(data))
  }

  private getPaletteBuffer(code: number, index: number): Buffer[] {
    const descriptor: PaletteDescriptor = AvatarDefinitions.getPalette(code, index)
    const palette: Palette = AvatarAssets.getPalette(descriptor)
    const buffer: Buffer[] = palette.colors.map((color: `#${string}`) => {
      const hex: string = color.slice(1)
      return Buffer.from(hex, 'hex')
    })
    return buffer
  }

  async uploadPalette(code: number, index: number): Promise<providers.TransactionResponse> {
    const buffer: Buffer[] = this.getPaletteBuffer(code, index)
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx = await this.paletteStore.uploadPalette(code, index, buffer, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    tx.wait().then((receipt: providers.TransactionReceipt) => {
      this.notify({ palette: AvatarDefinitions.getPalette(code, index), tx, receipt })
    })
    return tx
  }

  private getPaletteBuffers(code: number, fromIndex: number = 0): Buffer[][] {
    const batch: Buffer[][] = []
    const palettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(code)
    for (let i = fromIndex; i < palettes.length; i++) {
      const palette: PaletteDescriptor = palettes[i]
      // safety guard
      if (i !== palette.index) {
        throw new Error(`Palette index ${i} does not match descriptor index ${palette.index}`)
      }
      const buffer: Buffer[] = this.getPaletteBuffer(code, palette.index)
      batch.push(buffer)
    }
    return batch
  }

  async uploadPalettes(code: number, fromIndex: number = 0): Promise<providers.TransactionResponse> {
    this.console.log(`Uploading palettes for code ${code}${fromIndex > 0 ? ` from index ${fromIndex}` : ''}`)
    const batch: Buffer[][] = this.getPaletteBuffers(code, fromIndex)
    if (batch.length === 0) {
      let msg = `No palettes to upload for code ${code}`
      if (fromIndex > 0) {
        msg += ` from index ${fromIndex}`
      }
      throw new Error(`No palettes to upload for code ${code}`)
    }
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx = await this.paletteStore.uploadPaletteBatch(code, fromIndex, batch, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    tx.wait().then((receipt: providers.TransactionReceipt) => {
      this.notifyBatch({ palettes: AvatarDefinitions.getPalettesByCode(code), tx, receipt })
    })
    return tx
  }

  async uploadPalettes2(palettes: PaletteDescriptor[]): Promise<providers.TransactionResponse> {
    const batch: Buffer[][] = palettes.map((palette) => this.getPaletteBuffer(palette.code, palette.index))
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx = await this.paletteStore.uploadPaletteBatch(palettes[0].code, palettes[0].index, batch, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    tx.wait().then((receipt: providers.TransactionReceipt) => {
      this.notifyBatch({ palettes, tx, receipt })
    })
    return tx
  }

  async getUploadPaletteBatchInputs(): Promise<UploadPaletteBatchInput[]> {
    const currentNumPaletteCodes: number = await this.paletteStore.getNumPaletteCodes()
    this.console.log(`Current number of palette codes: ${currentNumPaletteCodes}`)

    const allUploadPaletteBatchInputs: UploadPaletteBatchInput[] = []
    for (let code = 0; code < AvatarDefinitions.getNumPaletteCodes(); code++) {
      // determine how many palettes are already uploaded for this code
      let fromIndex: number = 0
      if (code < currentNumPaletteCodes) {
        fromIndex = await this.paletteStore.getNumPalettes(code)
      }

      // log
      if (fromIndex === AvatarDefinitions.getNumPalettes(code)) {
        this.console.log(`\tContract already has ALL ${fromIndex} palettes for code ${code}`)
      } else if (fromIndex > 0) {
        this.console.log(`\tContract already has ${fromIndex} palettes for code ${code}`)
      }

      // we will upload some palettes, so we are going to need the palette buffers
      const palettes: PaletteDescriptor[] = AvatarDefinitions.getPalettesByCode(code)

      const toUpload: PaletteDescriptor[] = []
      for (let i = fromIndex; i < palettes.length; i++) {
        toUpload.push(palettes[i])
      }

      if (toUpload.length === 0) {
        this.console.log(`\nNo palettes to upload for code ${code}`)
        continue
      }

      // get the buffers for the palettes we are going to upload
      const buffers: Buffer[][] = toUpload.map((palette) => this.getPaletteBuffer(palette.code, palette.index))

      // form a batch input
      const input: UploadPaletteBatchInput = {
        code,
        fromIndex,
        palettes: buffers,
      }
      allUploadPaletteBatchInputs.push(input)
    }

    return allUploadPaletteBatchInputs
  }

  async estimateGasForBatch(batch: UploadPaletteBatchInput[]): Promise<BigNumber> {
    const transaction: PopulatedTransaction = await this.paletteStore.contract.populateTransaction.uploadPaletteBatches(
      batch
    )
    // very large
    let gasEstimate: BigNumber = BigNumber.from(69_420_000_000)

    try {
      gasEstimate = await this.paletteStore.contract.provider.estimateGas(transaction)
    } catch (e) {
      // If the gas estimate fails, we'll just use the gas limit
      let msg = `Gas estimate failed for batch: (codes: [${batch.map((b) => b.code)}])`
      if (batch.length === 1) {
        msg = `Gas estimate failed for code: ${batch[0].code}`
        this.console.error(`${msg}`)
        throw e
      } else {
        this.console.warn(`${msg}`)
      }
    }

    return gasEstimate
  }

  /**
   * Generates batches of `UploadPaletteBatchInput` that fit within a given gas limit.
   *
   * This generator function splits the `UploadPaletteBatchInput` array into batches that
   * will fit within the given gas limit when processed. If a single item exceeds the gas limit,
   * an error is thrown.
   *
   * @param {UploadPaletteBatchInput[]} uploadPaletteBatchInputs - Array of `UploadPaletteBatchInput` objects to batch.
   * @param {number} gasLimit - The maximum gas amount that a batch should use.
   *
   * @yields {UploadPaletteBatchInput[]} Returns a batch of `UploadPaletteBatchInput` objects.
   *
   * @throws Will throw an error if a single `UploadPaletteBatchInput` exceeds the gas limit.
   */
  async *generateBatches(
    uploadPaletteBatchInputs: UploadPaletteBatchInput[],
    gasLimit: number
  ): AsyncGenerator<UploadPaletteBatchInputsWithGasEstimate, void, unknown> {
    let batchWithGasEstimate: UploadPaletteBatchInputsWithGasEstimate = {
      uploadPaletteBatchInputs: [],
      gasEstimate: BigNumber.from(0),
    }
    let pointer = 0

    while (pointer < uploadPaletteBatchInputs.length) {
      // Try adding the next input to the current batch
      const tempBatch = [...batchWithGasEstimate.uploadPaletteBatchInputs, uploadPaletteBatchInputs[pointer]]

      // Convert the batch codes to a string for logging purposes
      const tempBatchCodes: number[] = tempBatch.map((b) => b.code)
      const tempBatchCodesStr: string = ('(' + tempBatchCodes.toString() + ')').padEnd(50, ' ')

      // Estimate gas required for the potential new batch
      let tempGasEstimate = await this.estimateGasForBatch(tempBatch)

      const green = '\u001b[32m'
      const yellow = '\u001b[33m'
      const reset = '\u001b[0m'
      if (!tempGasEstimate.gt(gasLimit)) {
        // CASE 1: The new batch is within the gas limit

        // Log the successful gas estimate
        this.console.log(
          `${green}  ${tempBatchCodesStr}\tGas estimate: ${fmtCommas(tempGasEstimate.toNumber())}${reset}`
        )

        // Accept the new item into the current batch and update the gas estimate
        batchWithGasEstimate = {
          uploadPaletteBatchInputs: tempBatch,
          gasEstimate: tempGasEstimate,
        }
        pointer++
      } else {
        // CASE 2: The new batch exceeds the gas limit

        // Warn about the exceeded gas estimate
        this.console.warn(
          `${yellow}  ${tempBatchCodesStr}\tGas estimate: ${fmtCommas(tempGasEstimate.toNumber())} (OVER LIMIT)${reset}`
        )
        if (batchWithGasEstimate.uploadPaletteBatchInputs.length > 0) {
          // If the current batch (without the new item) has some items,
          // we yield this batch.
          yield batchWithGasEstimate

          // Reset the batch after yielding
          batchWithGasEstimate = {
            uploadPaletteBatchInputs: [],
            gasEstimate: BigNumber.from(0),
          }
        } else {
          // If the current item alone exceeds gas limit, we should log and skip it
          // this.console.warn(`Single batch with code ${uploadPaletteBatchInputs[pointer].code} exceeds gas limit.`)
          // pointer++ // move to the next item
          throw new Error(`Single batch with code ${uploadPaletteBatchInputs[pointer].code} exceeds gas limit.`)
        }
      }
    }

    if (batchWithGasEstimate.uploadPaletteBatchInputs.length > 0) {
      yield batchWithGasEstimate
    }
  }

  async processBatch(batch: UploadPaletteBatchInputsWithGasEstimate): Promise<void> {
    const codes = batch.uploadPaletteBatchInputs.map((b) => b.code)
    const paletteCountsPerCode = batch.uploadPaletteBatchInputs.map((b) => b.palettes.length)
    const totalPalettes = paletteCountsPerCode.reduce((a, b) => a + b, 0)

    this.console.log(
      `Processing batch: (codes: [${codes}]) with ${totalPalettes} palettes ([${paletteCountsPerCode}]) and gas estimate ${fmtCommas(
        batch.gasEstimate.toNumber()
      )}...`
    )
    await confirmIfPublicDeployment(this.hre, this.console)
    const tx = await this.paletteStore.uploadPaletteBatches(batch.uploadPaletteBatchInputs, this.gasParams)
    this.console.log(`    tx: ${tx.hash}`)
    const receipt = await tx.wait()

    this.notifyBatch({
      palettes: batch.uploadPaletteBatchInputs.map((b) => AvatarDefinitions.getPalettesByCode(b.code)).flat(),
      tx,
      receipt,
    })
  }

  async uploadAll(gasLimit: number = 15_000_000): Promise<void> {
    const allUploadPaletteBatchInput: UploadPaletteBatchInput[] = await this.getUploadPaletteBatchInputs()

    for await (const batch of this.generateBatches(allUploadPaletteBatchInput, gasLimit)) {
      await this.processBatch(batch)
    }
  }

  async uploadAllTestOnly(): Promise<void> {
    const alreadyUploaded = await this.paletteStore.getNumPaletteCodes()
    for (let code = alreadyUploaded; code < AvatarDefinitions.getNumPaletteCodes(); code++) {
      const tx: providers.TransactionResponse = await this.uploadPalettes(code)
      await tx.wait()
    }
  }
}
