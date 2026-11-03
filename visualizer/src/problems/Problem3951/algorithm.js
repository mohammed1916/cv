export const code = `set need to the ceiling of brightness divided by three
sort the intervals by start time
merge intervals that overlap or touch into blocks
energy is zero
for each block from start to end
  add need times the block length to energy
return energy`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_energy(n, brightness, intervals):
    need = (brightness + 2) // 3
    blocks = []
    for start, end in sorted(intervals):
        if blocks and start <= blocks[-1][1]:
            blocks[-1][1] = max(blocks[-1][1], end)
        else:
            blocks.append([start, end])
    energy = 0
    for start, end in blocks:
        energy += need * (end - start + 1)
    return energy
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with bulbs, brightness and intervals.')
  const { bulbs, brightness, intervals } = input
  if (!Number.isInteger(bulbs) || bulbs < 1 || bulbs > 12) throw new Error('bulbs is an integer from 1 to 12.')
  if (!Number.isInteger(brightness) || brightness < 1 || brightness > bulbs) throw new Error('brightness is an integer from 1 to bulbs.')
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 8) throw new Error('intervals holds 1 to 8 pairs.')
  for (const pair of intervals) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger) || pair[0] < 0 || pair[0] > pair[1] || pair[1] > 40) {
      throw new Error('Each interval is [start, end] with 0 <= start <= end <= 40.')
    }
  }
  return { bulbs, brightness, intervals }
}

export function buildTrace({ bulbs, brightness, intervals }) {
  const frames = []
  const need = Math.ceil(brightness / 3)
  const push = (phase, codeText, pyText, state, message) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), need, ...state, message,
  })
  push('start', 'set need to the ceiling', 'need = (brightness + 2) // 3', { blocks: [], energy: 0, current: -1 }, `Each active bulb lights at most three positions, so ${need} active bulb${need === 1 ? '' : 's'} per time unit covers ${brightness}.`)
  const sorted = [...intervals].sort((x, y) => x[0] - y[0] || x[1] - y[1])
  push('sort', 'sort the intervals by start time', 'sorted(intervals)', { blocks: [], energy: 0, current: -1, order: sorted }, 'Sort the requested intervals by start time.')
  const blocks = []
  sorted.forEach(([start, end], index) => {
    const last = blocks[blocks.length - 1]
    if (last && start <= last[1]) last[1] = Math.max(last[1], end)
    else blocks.push([start, end])
    push('merge', 'merge intervals that overlap or touch', 'if blocks and start', { blocks: blocks.map(b => [...b]), energy: 0, current: blocks.length - 1, order: sorted, index }, `Interval [${start}, ${end}] joins block ${blocks.length - 1 + 1}; the blocks now cover ${blocks.map(([s, e]) => `[${s}, ${e}]`).join(' ')}.`)
  })
  let energy = 0
  blocks.forEach(([start, end], index) => {
    energy += need * (end - start + 1)
    push('add', 'add need times the block length', 'energy += need', { blocks: blocks.map(b => [...b]), energy, current: index }, `Block [${start}, ${end}] has ${end - start + 1} time unit${end - start === 0 ? '' : 's'}, adding ${need * (end - start + 1)} energy.`)
  })
  push('done', 'return energy', 'return energy', { blocks: blocks.map(b => [...b]), energy, current: -1 }, `Minimum energy is ${energy}.`)
  return { input: { bulbs, brightness, intervals }, result: energy, frames }
}
