export function capitalizeWords(str: string): string {
  const words = str.split(' ')
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  })
  return capitalizedWords.join(' ')
}
