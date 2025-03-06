// const base64 = openAvatarURI.split('data:application/json;base64,')[1]
// const decoded = Buffer.from(base64, 'base64').toString('ascii')
// const obj = JSON.parse(decoded)
// const tokenId: number = obj.token_id
// const generation: number = obj.generation
// const renderer: string = obj.renderer
// const creator: string = obj.creator

interface OpenAvatarURI {
  token_id: number
  generation: number
  renderer: `0x${string}`
  creator: `0x${string}`
}

export function decodeOpenAvatarURI(uri: string): OpenAvatarURI {
  const base64 = uri.split('data:application/json;base64,')[1]
  const decoded = Buffer.from(base64, 'base64').toString('ascii')
  const obj: OpenAvatarURI = JSON.parse(decoded)
  return obj
}
