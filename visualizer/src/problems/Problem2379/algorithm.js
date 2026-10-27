export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.blocks !== 'string' || !Number.isInteger(input.k)) throw new Error('Use an object with a string blocks and an integer k.')
  if (input.blocks.length < 1 || input.blocks.length > 40) throw new Error('blocks must have 1 to 40 characters.')
  if (!/^[WB]+$/.test(input.blocks)) throw new Error('blocks may only contain W (white) and B (black).')
  if (input.k < 1 || input.k > input.blocks.length) throw new Error('k must be from 1 up to the length of blocks.')
  return { blocks: input.blocks, k: input.k }
}

export function buildTrace({ blocks, k }) {
  const frames = []
  let white = [...blocks.slice(0, k)].filter(ch => ch === 'W').length
  let best = white
  frames.push({ phase: 'start', activeLine: L('set white to the number'), start: 0, white, best, message: `The first window of ${k} blocks has ${white} white blocks.` })
  frames.push({ phase: 'record', activeLine: L('set best to white'), start: 0, white, best, message: `Best recolors so far: ${best}.` })
  for (let start = 1; start <= blocks.length - k; start++) {
    if (blocks[start - 1] === 'W') white--
    if (blocks[start + k - 1] === 'W') white++
    frames.push({ phase: 'slide', activeLine: L('if blocks at start minus 1'), start, white, best, message: `The window moves to start ${start}; it has ${white} white blocks.` })
    if (white < best) {
      best = white
      frames.push({ phase: 'record', activeLine: L('if white is less than best'), start, white, best, message: `A window with ${white} recolors is better.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, white, best, message: `Minimum recolors: ${best}.` })
  return { input: { blocks, k }, result: best, frames }
}

export const code = `minimum recolors to get k consecutive black blocks (blocks, k):
  set white to the number of W in the first k blocks
  set best to white
  for each start from 1 to the length of blocks minus k
    if blocks at start minus 1 is W then subtract 1 from white
    if blocks at start plus k minus 1 is W then add 1 to white
    if white is less than best then set best to white
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_recolors(blocks, k):
    white = blocks[:k].count('W')
    best = white
    for start in range(1, len(blocks) - k + 1):
        if blocks[start - 1] == 'W':
            white -= 1
        if blocks[start + k - 1] == 'W':
            white += 1
        best = min(best, white)
    return best
`
