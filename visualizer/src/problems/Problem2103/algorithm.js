// LeetCode 2103: Rings and Rods.
// Each rod keeps the set of colours of the rings on it. A rod counts when all three colours appear.

export function parseInput(text) {
  const rings = text.trim()
  if (rings.length < 2 || rings.length % 2 !== 0 || rings.length > 200) throw new Error('Use an even-length string of colour and rod pairs, e.g. R3G2B1 (at most 100 rings).')
  for (let i = 0; i < rings.length; i += 2) {
    if (!'RGB'.includes(rings[i]) || !/[0-9]/.test(rings[i + 1])) throw new Error('Each pair is a colour R, G or B followed by a rod digit 0 to 9.')
  }
  return { rings }
}

export const code = `function countRods(rings) {
  const colours = Array.from({ length: 10 }, () => new Set())
  for (let i = 0; i < rings.length; i += 2) {
    colours[Number(rings[i + 1])].add(rings[i])
  }
  return colours.filter(set => set.size === 3).length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: count_rods
def count_rods(rings):
    colours = [set() for _ in range(10)]
    for i in range(0, len(rings), 2):
        colours[int(rings[i + 1])].add(rings[i])
    return sum(1 for rod in colours if len(rod) == 3)
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

export const phases = [
  { id: 'start', label: 'Empty rods', description: 'Ten rods, each with no colours yet.' },
  { id: 'place', label: 'Place ring', description: 'Add the ring colour to the rod it sits on.' },
  { id: 'count', label: 'Count', description: 'Rods holding all three colours are counted.' },
  { id: 'done', label: 'Result', description: 'The number of full rods.' },
]

export function buildTrace({ rings }) {
  const frames = []
  const colours = Array.from({ length: 10 }, () => new Set())
  const view = () => colours.map(set => [...set].sort().join(''))
  frames.push({ phase: 'start', activeLine: L('Array.from'), pythonLine: P('colours = [set()'), message: 'Ten empty rods, numbered 0 to 9.', rods: view(), current: -1, full: [] })
  for (let i = 0; i < rings.length; i += 2) {
    const colour = rings[i]
    const rod = Number(rings[i + 1])
    colours[rod].add(colour)
    frames.push({ phase: 'place', activeLine: L('.add(rings[i])'), pythonLine: P('colours[int'), message: `Ring ${colour} goes on rod ${rod}; that rod now has ${[...colours[rod]].sort().join(', ')}.`, rods: view(), current: rod, full: [] })
  }
  const full = colours.map((set, index) => (set.size === 3 ? index : -1)).filter(index => index >= 0)
  frames.push({ phase: 'count', activeLine: L('filter'), pythonLine: P('return sum'), message: full.length ? `Rods ${full.join(', ')} hold all three colours.` : 'No rod holds all three colours.', rods: view(), current: -1, full })
  frames.push({ phase: 'done', activeLine: L('filter'), pythonLine: P('return sum'), message: `The answer is ${full.length}.`, rods: view(), current: -1, full })
  return { input: { rings }, result: full.length, frames }
}
