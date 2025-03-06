import fetch, { Response } from 'node-fetch'

/**
 * Class that retrieves the current Ethereum price in USD
 */
export class Coingecko {
  /**
   * Method to get Ethereum price in USD
   * @returns {Promise<number>} - Returns a promise that resolves to the Ethereum price in USD
   */
  public async getETHPrice(): Promise<number> {
    try {
      const response: Response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )

      const json: { ethereum: { usd: string } } = await response.json()
      return parseFloat(json.ethereum.usd)
    } catch (error) {
      console.error(error)
      return 0
    }
  }
}
