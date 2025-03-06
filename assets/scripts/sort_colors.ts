import { ColorCode } from '../src/lib/ImageProperties'
import { HSV, RGB, extract, getPalettes, normalize, rgbToHsv } from './ScriptUtils'

function main(args: string[]): void {
  if (args.length !== 1) {
    console.error('Usage: sort_colors.ts <code_name>')
    process.exit(1)
  }

  const base_dir = 'assets/palettes/base/'
  const code_name = args[0]
  const dir = base_dir + code_name
  const palettes = getPalettes(dir)

  type PaletteAvg = RGB & { paletteName: string; hsv: HSV }
  const avgColors: PaletteAvg[] = []
  for (const paletteName of Object.keys(palettes)) {
    const palette: ColorCode[] = palettes[paletteName]
    const normalColor = normalize(extract(palette))
    const hsvColor = rgbToHsv(normalColor)
    avgColors.push({ ...normalColor, paletteName, hsv: hsvColor })
  }

  // Define color priorities
  const colorPriority: string[] = ['__black', '__dark_gray', '__gray', 'light_gray', '__white'] // Add more colors as needed

  // Filter out the colors that need to be in the front and sort them
  const frontColors = avgColors
    .filter((color) => colorPriority.some((priority) => color.paletteName.includes(priority)))
    .sort((a, b) => {
      return colorPriority.indexOf(a.paletteName.split('__')[1]) - colorPriority.indexOf(b.paletteName.split('__')[1])
    })

  // Filter out the rest and sort by hue
  const otherColors = avgColors
    .filter((color) => !colorPriority.some((priority) => color.paletteName.includes(priority)))
    .sort((a, b) => a.hsv.h - b.hsv.h)

  // Merge the two lists
  const sortedColors = [...frontColors, ...otherColors]

  // print sorted palettes
  // type PaletteMove = { paletteName: string; newName: string }
  type Info = { csvLine: string; mvOp: string; paletteName: string }
  const infos: Info[] = []
  sortedColors.forEach((color, index) => {
    const palette: ColorCode[] = extract(palettes[color.paletteName])

    const csvLine: string = `${(index + 1).toString().padStart(3, '0')};${palette.join(';')};`
    console.log(csvLine)

    const basename = color.paletteName.split('__')[2]
    let file_prefix = code_name.endsWith('s') ? code_name.slice(0, -1) : code_name
    const mv = {
      paletteName: color.paletteName,
      newName: `${file_prefix}__${(index + 1).toString().padStart(3, '0')}__${basename}`,
    }
    const mvOp = `mv ${dir}/${mv.paletteName}.pal ${dir}/${mv.newName}.pal`

    infos.push({ csvLine, mvOp, paletteName: mv.newName })
  })

  // print mv commands
  console.log('\n\n')
  infos.forEach((info, index) => {
    const args = info.mvOp.split(' ')
    if (args.length !== 3) {
      throw new Error('mv command has wrong number of arguments')
    }
    if (args[1] !== args[2]) {
      let msg = info.mvOp
      if (index !== infos.length - 1) {
        msg += ' && \\'
      }
      console.log(msg)
    }
  })

  // print strings commands
  console.log()
  infos.forEach((info) => {
    console.log(`    '${info.paletteName}',`)
  })

  const ct = avgColors.length
  // print the indexes in random order at end of script for copy paste reasons
  // console.log('\n\n')
  const randOrderIndexes = avgColors.map((_, index) => index)
  // shuffle
  for (let i = 0; i < ct; i++) {
    const j = Math.floor(Math.random() * ct)
    const tmp = randOrderIndexes[i]
    randOrderIndexes[i] = randOrderIndexes[j]
    randOrderIndexes[j] = tmp
  }
  randOrderIndexes.forEach((index_) => {
    // console.log(`${index_}. <...>`)
  })
}

main(process.argv.slice(2))
