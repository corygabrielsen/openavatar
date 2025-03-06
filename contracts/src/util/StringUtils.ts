export function fmtCommas(number: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  })
  return formatter.format(number)
}

export function secToDayMinSec(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

export function stringToBytes32(salt: string): Buffer {
  if (salt.startsWith('0x')) {
    salt = salt.slice(2)
  }
  return Buffer.from(salt.padStart(64, '0'), 'hex')
}
