// ensure uniqueness of addresses to prevent refactor bugs
export function ensureUniqueAddresses(addresses: string[]) {
  if (new Set(addresses).size !== addresses.length) {
    console.error('Duplicate addresses detected')
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i]
      if (addresses.indexOf(address) !== i) {
        console.error(`Duplicate address: ${address}`)
      }
    }
    throw new Error('Duplicate addresses detected')
  }
}
