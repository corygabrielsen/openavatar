import { Contract } from 'ethers'
import { writeFileSync } from 'fs'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { join } from 'path'

export const ROOT_DIR = join(__dirname, '..')
export const ARTIFACTS_DIR = join(__dirname, '../artifacts')

export async function getTokenURI(hre: HardhatRuntimeEnvironment, address: string, tokenId: number): Promise<string> {
  const minABI = ['function tokenURI(uint256 tokenId) external view returns (string memory)']

  const contract: Contract = new hre.ethers.Contract(address, minABI, hre.ethers.provider)
  const tokenURI: string = await contract.tokenURI(tokenId)

  return tokenURI
}

export interface TokenURIData {
  imageDecoded: string | Buffer
  imageType: 'svg' | 'png' | 'other'
}

export function decodeTokenURI(tokenURI: string): TokenURIData {
  if (tokenURI.startsWith('data:application/json;base64,')) {
    const base64: string = tokenURI.replace('data:application/json;base64,', '')
    const jsonStr: string = Buffer.from(base64, 'base64').toString('utf-8')
    const json: { image: string } = JSON.parse(jsonStr)

    const imageUri: string = json.image
    if (imageUri.startsWith('data:image/svg+xml;base64,')) {
      const base64: string = imageUri.replace('data:image/svg+xml;base64,', '')
      const svg: string = Buffer.from(base64, 'base64').toString('utf-8')

      return {
        imageDecoded: svg,
        imageType: 'svg',
      }
    } else if (imageUri.startsWith('data:image/png;base64,')) {
      console.log(JSON.stringify(json, null, 2))
      const base64: string = imageUri.replace('data:image/png;base64,', '')
      const png: Buffer = Buffer.from(base64, 'base64')
      return {
        imageDecoded: png,
        imageType: 'png',
      }
    } else {
      return {
        imageDecoded: imageUri,
        imageType: 'other',
      }
    }
  } else {
    throw new Error(`Invalid tokenURI: ${tokenURI}`)
  }
}

export function writeSvgToFile(svgData: string, tokenId: number): string {
  const filepath = join(__dirname, `../artifacts/image${tokenId}.svg`)
  writeFileSync(filepath, svgData)
  return filepath
}

export function writePngToFile(pngData: Buffer, tokenId: number): string {
  const filepath = join(__dirname, `../artifacts/image${tokenId}.png`)
  writeFileSync(filepath, pngData)
  return filepath
}

export function displayImage(imageData: string): void {
  console.log(imageData)
}
