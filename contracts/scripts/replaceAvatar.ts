import { Avatar, AvatarLayerStack, DNA, PatternPaletteDescriptor } from '@openavatar/types'
import fs from 'fs'

// Function to validate DNA format
function isValidDNA(dna: string): boolean {
  const REGEX = /^0x[a-fA-F0-9]{64}$/
  return REGEX.test(dna)
}

// Function to display the differences in two DNA strings
function displayDifferences(from: string, to: string): void {
  let FROM_DISPLAY_STR = '0x'
  let TO_DISPLAY_STR = '0x'

  for (let i = 0; i < from.length; i++) {
    if (from[i] === to[i]) {
      FROM_DISPLAY_STR += from[i]
      TO_DISPLAY_STR += to[i]
    } else {
      // Note: Console colors might be different in different environments
      FROM_DISPLAY_STR += `\x1b[31m${from[i]}\x1b[0m` // Red color for differences in 'from'
      TO_DISPLAY_STR += `\x1b[32m${to[i]}\x1b[0m` // Green color for differences in 'to'
    }
  }

  console.log(FROM_DISPLAY_STR)
  console.log(TO_DISPLAY_STR)
}

// copy pasted from CartItem.tsx
const reduceAvatar = (avatar: Avatar) => {
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

function writeToFile(avatar: Avatar): void {}

// Main function
function main(): void {
  // Check if the right number of arguments are provided
  if (process.argv.length !== 4) {
    console.error('Usage: ts-node scriptName.ts <from> <to>')
    process.exit(1)
  }

  const from = process.argv[2]
  const to = process.argv[3]

  // Validate the provided DNAs
  if (!isValidDNA(from)) {
    console.error(`Invalid from address: ${from}`)
    process.exit(1)
  }

  if (!isValidDNA(to)) {
    console.error(`Invalid to address: ${to}`)
    process.exit(1)
  }

  // Display differences
  displayDifferences(from, to)

  // delete old file
  const oldFilename = `src/avatars/first100/${from}.json`
  let deleted = false
  try {
    fs.unlinkSync(oldFilename)
    deleted = true
  } catch (err) {
    // console.error(err)
  }

  // add the new "to" avatar to the src/avatars/first100/<dna>.json file
  const avatar: Avatar = new Avatar(new DNA(to))
  const avatarData = reduceAvatar(avatar)
  const jsonStr = JSON.stringify(avatarData, null, 2)
  const filename = `src/avatars/first100/${avatar.dna.toString()}.json`
  fs.writeFileSync(filename, jsonStr)

  if (deleted) {
    console.log(`\x1b[31m${oldFilename}\x1b[0m`)
  }
  console.log(`\x1b[32m${filename}\x1b[0m`)

  const cwd = process.cwd()

  // update the scripts/formatAvatars.ts file
  const cmd = `sed -i 's/${from}/${to}/g' ${cwd}/scripts/formatAvatars.ts`
  console.log(cmd)

  // run command
  const execSync = require('child_process').execSync
  const output = execSync(cmd, { encoding: 'utf-8' })
  console.log(output)

  // finally, run yarn ts-node scripts/formatAvatars.ts
  const cmd2 = `yarn format:avatars`
  console.log(cmd2)

  // run command
  const execSync2 = require('child_process').execSync
  const output2 = execSync2(cmd2, { encoding: 'utf-8' })
  console.log(output2)
}

main()
