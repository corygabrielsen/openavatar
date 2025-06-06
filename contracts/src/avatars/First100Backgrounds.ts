type BackgroundColor = `#${string}` | undefined

export const FIRST_100_BACKGROUND_COLORS: BackgroundColor[] = [
  // #1 - #10
  '#87ceeb',
  // '#FCF094',
  // '#ddf5f7',
  // '#a4ccfe',
  // '#ffa0e2',
  // '#efdc9a',
  // '#49796b',
  // '#fffcfc',
  // '#eed9b6',
  // '#ca4444',
  // // #11 - #20
  // '#47beef',
  // '#d8abfc',
  // '#ccbeef',
  // '#fab628',
  // '#ffb6c1',
  // '#bae7ad',
  // undefined,
  // '#ff6b19',
  // '#27abff',
  // '#eb5f74',
  // // #21 - #30
  // '#6d7550',
  // '#78e0be',
  // '#c9082a',
  // '#96cdf4',
  // '#f1d0fe',
  // '#cae0ff',
  // '#A8DB52',
  // '#fff2b3',
  // '#FF8C00',
  // '#A6E8FF',
  // // #31 - #40
  // '#FFF596',
  // '#00BFD5',
  // '#fff5e1',
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #41 - #50
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #51 - #60
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #61 - #70
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #71 - #80
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #81 - #90
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  // #91 - #100
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
].map((color: string | undefined) => {
  if (!color) {
    return undefined as BackgroundColor
  }
  return color.toLowerCase() as BackgroundColor
})
