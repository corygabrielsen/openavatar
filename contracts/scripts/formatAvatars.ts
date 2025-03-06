import {
  Avatar,
  AvatarBuilderShortHand,
  AvatarLayerStack,
  PatternPaletteDescriptor,
  PatternPaletteShortHand,
} from '@openavatar/types'
import fs from 'fs'

class SeededRNG {
  private seed: number

  constructor(seed: number) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  // Return a pseudo-random value between 0 and 1
  nextFloat(): number {
    return (this.next() - 1) / 2147483646
  }

  private next(): number {
    return (this.seed = (this.seed * 16807) % 2147483647)
  }
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = new SeededRNG(seed)

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.nextFloat() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

const AVATARS_DIR = `${__dirname}/../src/avatars/first100`

function makeBuilder(avatar: Avatar): AvatarBuilderShortHand {
  const obj: AvatarBuilderShortHand = {}
  for (const layer of AvatarLayerStack.iter()) {
    const patternPalette: PatternPaletteDescriptor = avatar.get(layer)
    if (['bald', 'naked', 'none'].includes(patternPalette.pattern.name)) {
      continue
    }

    const patternPaletteShorthand: PatternPaletteShortHand = [
      patternPalette.pattern.name,
      patternPalette.palette.name.includes('theme__')
        ? new RegExp(`${patternPalette.palette.name.slice('theme__000'.length)}$`)
        : patternPalette.palette.name,
    ]

    obj[layer.name] = patternPaletteShorthand
  }

  return obj
}

interface Input {
  filename: string
  avatar: Avatar
}

function gatherInputs(dir: string): Input[] {
  // read files in dir
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'))
  const inputs: Input[] = []
  for (const filename of files) {
    const file = fs.readFileSync(`${dir}/${filename}`)
    const json: any = JSON.parse(file.toString())
    const avatar: Avatar = new Avatar(json)
    inputs.push({ filename, avatar })
  }
  return inputs
}

// Seed value - you can change this to any number you want
// for a different deterministic shuffle.
const SHUFFLE_SEED = 69420

const FIRST: string[] = [
  // 1 - 5
  '0x020d0000000001000100380300001870000000000814000000000d0300000000', // gold space pants
  '0x021d00000000013a013a1f6807681068026800000109026800000d2912680000', // electric rain dreads
  '0x0222000000000100010038020000163d070301000900000000000d010dac0000', // gold and diamond
  '0x020700000000010001001f740000000000000000070004740000080210740000', // 3d blue
  '0x07020000063d013d013d300c0000320c00000000070000000000000014ab0000', // blonde pink crop top skirt
  // 6 - 10
  '0x032500000000015801581e73053d0000053d000009000000000000000faa0000', // blue eye blonde hair
  '0x01190479032d010001000a7900000000000000000f150279000009000e790000', // crest tattoo blue messy hair
  '0x020800000000013e013e031603160604000000000a0100000000000006ad0000', // slim shady
  '0x04660000000001000100382500000000046601000d01000000000d2e0caa0000', // cyan space_suit pants blonde hair sunburned
  '0x021c0000000001010101381f00001100000000000702000000000d1909980000', // black side part red space_suit pants
  // 11 - 15
  '0x031900000000013d013d140f0474110f000000000d090000000000000fab0000', // blonde shaggy mountain jumpsuit
  '0x030500000000013e013e268a000000000000000000000b9f00000000119f0000', // zeus (12)
  '0x05020509061903430343000005094e7500000000071400000000000016090000', // purple curly hair dress
  '0x031a00000000010001000341072f076000000000070e000000000f030e2f0000', // red messy green shirt
  '0x05140000063e013e013e227800003d780000000000000000000000001a780000', // coral reef bob
  // 16 - 20
  '0x060900000915013d013d000007294b1500000000010000000000000017b10000', // redhead behind ears summer dress
  '0x0102000000000100010000000000000000000000000000000000000000000000', // bald
  '0x042400000b1502510251102802280000032800000d04000000000d1a11280000', // red spiky hair
  '0x021100000000013d013d067b057011700000000001010000000000000d700000', // blue floppy hair
  '0x07070000063e0107010716090616211600000000040000000000000018160000', // soft pink medium hair
  // 21 - 25
  '0x020e0000000001200120381a00004f1a0000000000000aa20000101e0ca50000', // green shaggy hair
  '0x012a0000000001350135075d045d0b5d000000000d08000000001027105c0000', // teal short shaggy hair
  '0x02580000000001050105171b0704000000000000020100000000080000000000', // MJ
  '0x070500000816013d013d000005044b1d000000000d0000000000000016b10000', // redhead dress girl
  '0x08080000071a01380138318f07042a8f0000000008140000000000001b8f0000', // lavender hair and dress girl
  // 26 - 30
  '0x080400000919033f033f0000077f4c7f000000000d07000000000706167f0000', // evening frost dress and wavy hair
  '0x05190000091503210321000006414b41000000000e2300000000040615360000', // orange jungle dress
  '0x022200000000012f012f010001000700000000000a010bab00000e0014ab0000', // black jesus
  '0x02550000000003510351053606360736053600000b0e000000000d1b1e360000', // orange fro
  '0x030906730000013e013e000000000000000000000b0000000000000010730000', // tattooed blue guy
  // 31 - 35
  '0x02310000000001000100380700004f07000000000000000000000d150f2f0000', // sun space suit coral vr
  '0x03070000000001000100246b00000000056b00000000000000000d2900000000', // bald guy with blue gloves
  '0x022200000000012f012f05040504050400000000070109a80000103e14a90000', // white jesus (33)
  '0x023907810000013f013f1081078100000000010301010000000000000d810000', // periwinkle floppy hair
  '0x020304040d46010001000000070400000704020e000000000000000000000000', // + warpaint
  // 36 - 40
  '0x022100000000015b015b2372000000000751020100000000000000000e720000', // blue hands blue hair belt
  '0x07020000013d013f013f250a0000340c00000000070000000000110a140a0000', // underboob
  '0x021d00000b43010101010200030302000303010b0000000000000d1b00000000', // bald black clothes with belt
  '0x011a00000000010001000a7b077b0f3200000000000000000000010209a50000', // tortoiseshell glasses nerd
  '0x02180000052c01000100031f041f0f1f0000000000000b1f00000d1a0b1f0000', // desert dream fohawk
  // 41 - 45
  '0x03050000000001070107144205161142000000000d040000000005040db10000', // redhead floppy
  '0x01650000000001070107380000004f0000000000040000000000100300000000', // space traveler (42)
  '0x021900000000013a013a0670017013700000000000000270000010700e700000', // blue mustache shaggy
  '0x0222000000000000058e030201030b0400000000000005970000118e00000000', // different eyes
  '0x02140000000001010101047b053d0d66000000000701000000000d2f11730000', // spiky blue w glasses
  // 46 - 50
  '0x021900000000010501051700071b000000000000010100000000091900000000', // white MJ
  '0x02110000000001050105051a031a0f010000000001000000000000000f1a0000', // red shaggy hair with black/red clothes
  '0x06140000032201200120000000004d44000000000f1200000000000013440000', // hippy pharaoh
  '0x04190000000001350135047b0759215400000306000000000000000017590000', // caribbean hair with tunic strap
  '0x033b0000000001000100154207421742000000000d000242000010421f420000', // aurora tides fro
  // 51 - 55
  '0x070700000616010d010d38010000201800000000040000000000000015160000', // vneck black spacepants girl
  '0x025906000000013e013e000004700000000000000e26000000000e0101990000', // black with white stripes
  '0x053400000e460120012033390000000000000000000000000000000015390000', // rainforest X warpaint
  '0x01220000000001000100380300004f03000000000000047300000d010c730000', // diamond space_suit
  '0x014f0000000001000100380600004f06000000000000048100000e0203810000', // purple dark skin
  // 56 - 60
  '0x03090000000001000100141a00000000071b0206000008260000000001260000', // red boxer
  '0x060900000116033a033a260906094e09000000000700000000000706163b0000', // blonde curly hair (57)
  '0x03050000000001050105050002300d5100000000000008a6000000001da40000', // brown fro
  '0x0327000000000304030416510151115100000000000001a5000007030ea00000', // mustache earth vibes (59)
  '0x044100000000013e013e157400000000053d00000c0b000000000000113d0000', // off brand gloved hero
  // 61 - 65
  '0x07190000093d013d013d350a070a223e00000000010000000000000015ab0000', // blonde w yellow canary top
  '0x03660516000003510351000000000000000000000b0400000000000005160000', // red skullet guy
  '0x070800000916012101210000063b4b44000000000d0000000000000016b40000', // copper hair summer solstice dress
  '0x046400000114010f010f02090511111e00000000000004a200000c0900000000', // face shield
  '0x035c0000000001000100104b074b114b000000000000044b00000924074b0000', // green short hair dark skin
  // 66 - 70
  '0x08440000063f010501051f0c070c310800000000070000000000090c15080000', // girl boss
  '0x03110000000001590159057106710b7100000000091f06600000000011710000', // cloud looking guy
  '0x051d0000081501200120264100003441000000000e0c00000000000019410000', // orange pumpkin girl
  '0x031e00000000035103510000023100000000000000000b2c00000000140f0000', // naked long hair mountain (69)
  '0x05040000083d050c050c2e1105112211000000000d0700000000000015110000', // terminator princess
  // 71 - 75
  '0x04090000000001050105017c023c0a3c000000000000029c0000070b029c0000', // school principal
  '0x010700000000010001001302000000000000000000000000000010160e3f0000', // blonde with red led
  '0x042d000000000100010005840484118400000000000003840000108412840000', // chill cotton candy dreads
  '0x08090000061901100110262707274d2707270000070000000000000019270000', // peach pixie cut with gloves
  '0x06050000071601060106000005654b1600000000080000000000000014a10000', // simple red dress brunette
  // 76 - 80
  '0x07230000030502510251316b076b206b00000000000000000000070415660000', // blue skirt nerd girl
  '0x03360000000001410141268100000000058100000d070b840000000011840000', // periwinkle zeus
  '0x046400000000010001000702040a170a00000000091d000000000a0000000000', // sunshield
  '0x02420000000001290129105304530000000000000d220453000009280d530000', // floppy luminescent
  '0x032e0377000003510351000000000000000000000b0804740000000013740000', // naked coastal pharoah
  // 81 - 85
  '0x04090181000001120112040a070a0e0a0000000000000b0a000000001d0a0000', // cotton candy fro pocket shirt
  '0x050900000122012301232f3207323132000000000d2500000000000016320000', // pastel curly hair
  '0x012800000143012d012d05420142234201420000010a0000000000000d420000', // flashy w black lipstick
  '0x05650000011701050105263e073e4b3e000000000400000000000000183e0000', // yellow pretty dress
  '0x08050000063601470147328505652b8500000000070000000000000015840000', // lilac dress girl
  // 86 - 90
  '0x020d000000000119011904300230054c0230030600000000000000000ea60000', // shaggy brown tunic
  '0x040a06300000010501050000013800000000000000000b2c00000d1c052c0000', // orange hair balding
  '0x01360404000002510251176b00000000065f0000000000000000000000000000', // asian boxer light blue
  '0x060600000a3c02000200000007044b7900000000070c00000000000015000000', // winter dress horizontal eyes
  '0x021000000000015901592572000000000470000007090000000000000e700000', // blue hands blue messy hair
  // 91 - 95
  '0x022200000000013b013b037b0403117300000000072009a80000030114a60000', // selfie (91)
  '0x0319000000000351035103300430110100000102000000000000000008a90000', // plain gray khakis widows peak
  '0x07140000091501390139148b053d2b8b00000000070000000000030715370000', // purple dress gold shoes (93)
  '0x020d00000000012f012f046f02300f72000001080f200000000000000fb00000', // jeans auburn hair
  '0x06310000092c0335033535730747227300000000090100000000000013730000', // blue skirt with gold shoes
  // 96 - 100
  '0x0512000007210100010030290729312900000000082500000000102919290000', // tropical punch pixie cut
  '0x030100000115010d010d041601002100000000000d1005160000000011160000', // devil ish
  '0x0266000000000351035100000000000000000000000000000000000000000000', // sunburned
  '0x070700000a3d011001102608070c4c08000000000000000000000000150c0000', // pink hair pink dress
  '0x040b0000000002510251260400000000000000000000000000000000049e0000', // old skullet guy (100)
  // 101 - 105
  '0x022200000000013b013b027b0403047300000000070109a80000107014a60000', // (101)
  '0x020800000000013e013e047b037b06040000000009010000000000000fab0000', // (102)
  '0x03640000000001000100382500001768000000000814000000000a0000000000', // (103)
  '0x020e07740000013c013c1074077400000774010101010000000000000d740000', // (104)
]

function shouldMoveToFront(input: Input): boolean {
  // For the sake of this example, let's say we want
  // avatars whose filename starts with 'special' at the front.
  return FIRST.includes(input.avatar.dna.toString())
}

function ensureNoneMissing(input: Input[]): Input[] {
  // find the items that are not in the FIRST constant
  const missing = FIRST.filter((dna) => !input.some((i) => i.avatar.dna.toString() === dna))
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.length} items: ${missing.join(', ')}`)
  }
  return input
}

function deterministicOrderWithFrontPriority(inputs: Input[]): Input[] {
  // 1. Filter the items you want at the front.
  const frontItems = inputs.filter(shouldMoveToFront)
  // order front items according to the FIRST constant
  frontItems.sort((a, b) => {
    const aIndex = FIRST.indexOf(a.avatar.dna.toString())
    const bIndex = FIRST.indexOf(b.avatar.dna.toString())
    return aIndex - bIndex
  })

  // 2. Get the items that shouldn't be at the front.
  const remainingItems = inputs.filter((input) => !shouldMoveToFront(input))

  // 3. Shuffle the remaining items.
  const shuffledRemainingItems = seededShuffle(remainingItems, SHUFFLE_SEED)

  // 4. Prepend the filtered items to the front.
  return frontItems.concat(shuffledRemainingItems)
}

const FIRST_LENGTH = 104
function readAvatarJsons(dir: string) {
  if (FIRST.length > FIRST_LENGTH) {
    throw new Error(`FIRST.length = ${FIRST.length} > ${FIRST_LENGTH}`)
  }
  // read files in dir
  const rawInputs = gatherInputs(dir)

  // reorder
  const inputs = deterministicOrderWithFrontPriority(rawInputs)
  ensureNoneMissing(inputs)

  // reorder
  console.log("import { Avatar } from '@openavatar/types'\n\nexport const FIRST_100: Avatar[] = [")

  let i = 1
  for (const input of inputs) {
    const { filename, avatar } = input
    if (filename !== `${avatar.dna}.json`) {
      fs.renameSync(`${dir}/${filename}`, `${dir}/${avatar.dna}.json`)
    }
    console.log(`  // #${i++} ${avatar.dna.toString()}`)
    console.log('  new Avatar(')
    console.log(makeBuilder(avatar))
    console.log('  ),')
  }
  console.log(']')
}

function main() {
  // console.log('Formatting avatars...')
  readAvatarJsons(AVATARS_DIR)
}

main()
