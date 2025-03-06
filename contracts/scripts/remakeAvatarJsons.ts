import { Avatar, AvatarLayerStack, PatternPaletteDescriptor } from '@openavatar/types'
import fs from 'fs'
import { NPC, NPCAvatar } from '../src/avatars/NPC'

const npcMints: NPCAvatar[] = [...NPC.FIRST_100]

function reduceAvatar(avatar: Avatar) {
  const result: any = {}
  for (const layer of AvatarLayerStack.iter()) {
    const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
    if (!['none', 'bald', 'naked'].includes(patternPalette.pattern.name)) {
      result[layer.name] = {
        patternName: patternPalette.pattern.name,
        paletteName: patternPalette.palette.name,
      }
    }
  }
  return result
}

function writeAvatarJsons(dir: string) {
  for (const avatar of npcMints) {
    let avatarJson = JSON.stringify(reduceAvatar(avatar), null, 2)
    // add trailing new line if not exists
    if (!avatarJson.endsWith('\n')) {
      avatarJson = avatarJson + '\n'
    }
    const filename = `${dir}/${avatar.dna.toString()}.json`
    fs.writeFileSync(filename, avatarJson)
    console.log(`Wrote ${filename}`)
  }
}

function main() {
  const outDir = process.argv[2]
  writeAvatarJsons(outDir)
}

main()
