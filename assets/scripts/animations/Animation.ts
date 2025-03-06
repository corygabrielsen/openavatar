import { Avatar } from '@openavatar/types'

export type Animation<T> = {
  name: string
  frames: T[]
}

export type AvatarSequenceAnimation = Animation<Avatar>
