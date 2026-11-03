export const phases = [
  { id: 'start', label: 'Write equations', description: 'Let x be jumbo burgers and y be small burgers. Tomato slices give 4x + 2y and cheese slices give x + y.' },
  { id: 'solve', label: 'Eliminate y', description: 'Substitute y = cheese - x into the tomato equation. Halving the tomato count leaves x = tomato/2 - cheese.' },
  { id: 'check', label: 'Check counts', description: 'A solution must have whole, nonnegative counts. Both are checked before the answer is accepted.' },
  { id: 'done', label: 'Complete', description: 'Return [jumbo, small], or an empty list when no exact pair exists.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"tomatoSlices": 14, "cheeseSlices": 5}.')
  const { tomatoSlices, cheeseSlices } = input
  if (!Number.isInteger(tomatoSlices) || tomatoSlices < 0 || tomatoSlices > 1000000) throw new Error('tomatoSlices is an integer from 0 to 1000000.')
  if (!Number.isInteger(cheeseSlices) || cheeseSlices < 0 || cheeseSlices > 1000000) throw new Error('cheeseSlices is an integer from 0 to 1000000.')
  return { tomatoSlices, cheeseSlices }
}

export function buildTrace({ tomatoSlices, cheeseSlices }) {
  const frames = []
  const snap = (halves, jumbo, small, ok) => ({ tomatoSlices, cheeseSlices, halves, jumbo, small, ok })
  frames.push({ phase: 'start', activeLine: L('let jumbo'), pythonLine: P('halves ='), snapshot: snap(null, null, null, null), message: `Jumbo burgers use 4 tomato and 1 cheese; small burgers use 2 tomato and 1 cheese. Tomato is ${tomatoSlices}, cheese is ${cheeseSlices}.` })
  if (tomatoSlices % 2 !== 0) {
    frames.push({ phase: 'check', activeLine: L('return []'), pythonLine: P('return []'), snapshot: snap(null, null, null, false), message: `Every burger uses an even number of tomato slices, and ${tomatoSlices} is odd, so no exact pair exists.` })
    frames.push({ phase: 'done', activeLine: L('return []'), pythonLine: P('return []'), snapshot: snap(null, null, null, false), message: 'Return an empty list.' })
    return { input: { tomatoSlices, cheeseSlices }, result: [], frames }
  }
  const halves = tomatoSlices / 2
  frames.push({ phase: 'solve', activeLine: L('halves ='), pythonLine: P('halves ='), snapshot: snap(halves, null, null, null), message: `Halving the tomato equation gives 2x + y = ${halves}. Subtracting x + y = ${cheeseSlices} leaves x = ${halves} - ${cheeseSlices}.` })
  const jumbo = halves - cheeseSlices
  const small = cheeseSlices - jumbo
  frames.push({ phase: 'solve', activeLine: L('jumbo = halves'), pythonLine: P('jumbo = halves'), snapshot: snap(halves, jumbo, small, null), message: `Jumbo = ${jumbo}, and small = ${cheeseSlices} - ${jumbo} = ${small}.` })
  const ok = jumbo >= 0 && small >= 0
  frames.push({ phase: 'check', activeLine: L('if jumbo < 0'), pythonLine: P('if jumbo < 0'), snapshot: snap(halves, jumbo, small, ok), message: ok ? 'Both counts are nonnegative, so this is an exact pair.' : `${jumbo < 0 ? 'Jumbo' : 'Small'} is negative, so no burger mix uses everything.` })
  const result = ok ? [jumbo, small] : []
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return'), snapshot: snap(halves, jumbo, small, ok), message: ok ? `Return [${jumbo}, ${small}].` : 'Return an empty list.' })
  return { input: { tomatoSlices, cheeseSlices }, result, frames }
}

export const code = `burger counts (tomatoSlices, cheeseSlices):
  let jumbo be x and small be y, with 4x + 2y = tomato and x + y = cheese
  if tomato is odd: return []
  halves = tomato / 2
  jumbo = halves - cheese
  small = cheese - jumbo
  if jumbo < 0 or small < 0: return []
  return [jumbo, small]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def num_of_burgers(tomato_slices, cheese_slices):
    if tomato_slices % 2:
        return []
    halves = tomato_slices // 2
    jumbo = halves - cheese_slices
    small = cheese_slices - jumbo
    if jumbo < 0 or small < 0:
        return []
    return [jumbo, small]
`
