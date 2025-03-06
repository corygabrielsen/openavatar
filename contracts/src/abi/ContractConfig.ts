export type ContractConfig = {
  abi: any
  create2Address: `0x${string}`
  nonCreate2Address: `0x${string}`
  bytecode: `0x${string}`
  deployedBytecode: `0x${string}`
  args: any[]
  bestKnownSalt: Buffer
}
