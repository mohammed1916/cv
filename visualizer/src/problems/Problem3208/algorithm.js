export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.colors) || !Number.isInteger(input.k)) throw new Error('Use an object with an array colors and an integer k.')
  if (input.colors.length < 3 || input.colors.length > 40) throw new Error('colors must have 3 to 40 entries.')
  if (input.colors.some(v => v !== 0 && v !== 1)) throw new Error('Each entry of colors is 0 or 1.')
  if (input.k < 3 || input.k > input.colors.length) throw new Error('k must be from 3 up to the length of colors.')
  return { colors: input.colors, k: input.k }
}

export function buildTrace({ colors, k }) {
  const n = colors.length
  const frames = []
  let count = 0
  let run = 1
  frames.push({ phase: 'start', activeLine: L('set count to 0'), at: 0, run, count, members: [0], message: 'Start at tile 0. A run of one tile alternates trivially.' })
  for (let i = 1; i <= n + k - 2; i++) {
    const tile = i % n
    const before = (i - 1) % n
    if (colors[tile] !== colors[before]) run++
    else run = 1
    frames.push({ phase: 'scan', activeLine: L('if the tile at i differs'), at: tile, run, count, members: [], message: colors[tile] !== colors[before] ? `Tile ${tile} differs from its neighbour, so the alternating run grows to ${run}.` : `Tile ${tile} matches its neighbour, so the run restarts at 1.` })
    if (i >= k - 1 && run >= k) {
      count++
      const members = Array.from({ length: k }, (_, j) => (i - k + 1 + j) % n)
      frames.push({ phase: 'count', activeLine: L('add 1 to count'), at: tile, run, count, members, message: `The last ${k} tiles alternate, so this is one more group. Total ${count}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), at: -1, run, count, members: [], message: `Alternating groups of size ${k}: ${count}.` })
  return { input: { colors, k }, result: count, frames }
}

export const code = `number of alternating groups (colors, k):
  set n to the length of colors
  set count to 0 and run to 1
  for each position i from 1 to n plus k minus 2, reading the circle
    if the tile at i differs from the tile before it then add 1 to run
    otherwise set run to 1
    if i is at least k minus 1 and run is at least k then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_alternating_groups(colors, k):
    n = len(colors)
    count = 0
    run = 1
    for i in range(1, n + k - 1):
        if colors[i % n] != colors[(i - 1) % n]:
            run += 1
        else:
            run = 1
        if i >= k - 1 and run >= k:
            count += 1
    return count
`
