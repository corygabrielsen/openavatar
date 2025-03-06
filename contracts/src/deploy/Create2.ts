import { BigNumber, ethers } from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Deployable } from '../abi/Deployable'
import { fmtCommas, secToDayMinSec } from '../util/StringUtils'

const GREEN = '\u001b[32m'
const ORANGE = '\u001b[33m'
const CYAN = '\u001b[36m'
const GRAY = '\u001b[90m'
const ENDC = '\u001b[0m'

export interface Create2SaltInfo {
  args: any[]
  bestKnownSalt: Buffer
}

export interface Create2Input {
  contractName: string
  abi: any[]
  bytecode: string
  encodedArgs: string
  initCode: Buffer
  initCodeHash: string
}

function countLeadingZeros(hex: `0x${string}`): number {
  let numLeadingZeros = 0
  for (let i = 2; i < hex.length; i++) {
    if (hex[i] === '0') {
      numLeadingZeros++
    } else {
      break
    }
  }
  return numLeadingZeros
}

function toBytes32(salt: BigNumber): Buffer {
  return Buffer.from(salt.toHexString().slice(2).padStart(64, '0'), 'hex')
}

export function getCreate2Input(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  args: any[] = [],
  abi: any[],
  bytecode: string
): Create2Input {
  if (abi === undefined) {
    throw new Error(`getCreate2Input() abi is undefined`)
  }

  const constructorAbi = abi.filter((item: any) => item.type === 'constructor')

  let encodedArgs = ''
  if (constructorAbi.length > 0) {
    encodedArgs = hre.ethers.utils.defaultAbiCoder.encode(
      constructorAbi[0].inputs.map((input: any) => input.type),
      args
    )
  }

  const initCode = Buffer.from(bytecode.slice(2) + encodedArgs.slice(2), 'hex')
  const initCodeHash = ethers.utils.keccak256(initCode)
  return {
    contractName,
    abi,
    bytecode,
    encodedArgs,
    initCode,
    initCodeHash,
  }
}

interface SearchCreate2AddressOptions {
  hre: HardhatRuntimeEnvironment
  leadingZeros: number
  factoryAddress: `0x${string}`
  contractName: string
  args: any[]
  abi: any[]
  bytecode: string
  first?: BigNumber
  limit: number
}

export interface Create2Address {
  contractName: string
  factoryAddress: `0x${string}`
  salt: `0x${string}`
  saltBytes32: `0x${string}`
  initCodeHash: `0x${string}`
  address: `0x${string}`
}
export interface Create2AddressSearch {
  found: Create2Address
  expected: `0x${string}`
  matches: boolean
}

/**
 * Search for a create2 address with a given number of leading zeros
 * @param params leadingZeros: number of leading zeros to search for
 * @param params deployer: address of the deployer
 * @param params contractName: name of the contract
 * @param params args: constructor arguments
 * @param params abi: contract abi
 * @param params bytecode: contract bytecode
 * @param params first: first salt to try
 * @param params limit: maximum number of salts to try
 * @returns the address with the most leading zeros
 */
export function searchCreate2Address(
  params: SearchCreate2AddressOptions,
  configuredAddress: `0x${string}`
): Create2AddressSearch {
  const first: BigNumber = params.first || BigNumber.from(0)
  let salt: BigNumber = first
  let saltBytes32: Buffer = toBytes32(first)
  const create2Info = getCreate2Input(params.hre, params.contractName, params.args, params.abi, params.bytecode)

  let address: `0x${string}` = '0x'
  let attempt = 0
  let match = false
  let mostZeros = -1
  let best: Create2Address = {} as Create2Address
  let matchesConfigured = false
  const now = Date.now()
  do {
    salt = first.add(BigNumber.from(attempt))
    saltBytes32 = toBytes32(salt)
    address = ethers.utils.getCreate2Address(
      params.factoryAddress,
      saltBytes32,
      create2Info.initCodeHash
    ) as `0x${string}`
    matchesConfigured = configuredAddress === address
    // count number of leading zeros
    let numLeadingZeros = countLeadingZeros(address)
    if (numLeadingZeros > mostZeros) {
      mostZeros = numLeadingZeros
      best = {
        contractName: params.contractName,
        factoryAddress: params.factoryAddress,
        salt: salt.toHexString() as `0x${string}`,
        saltBytes32: `0x${saltBytes32.toString('hex')}` as `0x${string}`,
        initCodeHash: create2Info.initCodeHash as `0x${string}`,
        address,
      }
      console.log(
        `${mostZeros}/${params.leadingZeros} ${ORANGE}${
          params.contractName
        }${ENDC} w/ salt ${CYAN}${salt.toHexString()}${ENDC} => ${GREEN}${address}${ENDC}`
      )
      if (attempt === 0) {
        if (!matchesConfigured) {
          // log configuredAddress in red ansii
          console.error()
          console.error()
          const RED = '\u001b[31m'
          console.error(`${ORANGE}${params.contractName}${ENDC} ContractConfigs      ${RED}${configuredAddress}${ENDC}`)
          console.error(`${ORANGE}${params.contractName}${ENDC} searchCreate2Address ${GREEN}${address}${ENDC}`)
          // log sed command to fix source code
          const sedCommand = `sed -i 's/${RED}${configuredAddress}${ENDC}/${GREEN}${address}${ENDC}/g' contracts/src/abi/config/*.ts web/abi/ABI.ts`
          console.error(sedCommand)
          console.error()
          // throw new Error("Configured address doesn't match computed address. Update configuration in ABI.ts")

          if (params.contractName === Deployable.OwnerProxy) {
            throw new Error(sedCommand)
          }
        }
      }
      // console.log(
      //   JSON.stringify(best, null, 2)
      //     .split('\n')
      //     .map((line) => `  ${GRAY}${line}${ENDC}`)
      //     .join('\n')
      // )
    }
    match = mostZeros === params.leadingZeros
    attempt++
    if (attempt % 1_000_000 === 0) {
      const elapsed = Date.now() - now
      const rate = Math.floor(attempt / (elapsed / 1000))
      const expectedTimeTotal = 16 ** params.leadingZeros / rate
      const expectedTimeRemaining = expectedTimeTotal - elapsed / 1000
      console.log(
        `attempt: ${fmtCommas(attempt)} @ ${fmtCommas(rate)} addresses/sec (~${secToDayMinSec(
          expectedTimeRemaining
        )} remaining)`
      )
    }
  } while (!match && attempt < params.limit)
  if (!match && attempt === params.limit) {
    console.log(`Reached limit of ${fmtCommas(params.limit)} attempts`)
  }
  return {
    found: best,
    expected: configuredAddress,
    matches: matchesConfigured,
  }
}
