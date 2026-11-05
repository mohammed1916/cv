export const phases = [
  { id: 'start', label: 'Start', description: 'Group the numbers 1 to n by the sum of their digits. Equal digit sums share a group.' },
  { id: 'digits', label: 'Digit sum', description: 'Compute the digit sum of the current number and add it to its group.' },
  { id: 'group', label: 'New group', description: 'This digit sum has no group yet, so open one with its first member.' },
  { id: 'track', label: 'Track largest', description: 'Keep the group sizes and the largest size seen so far.' },
  { id: 'done', label: 'Complete', description: 'Count the groups that reach the largest size.' },
]

export const examples = [
  { label: 'Ten', input: '{"n":10}' },
  { label: 'One', input: '{"n":1}' },
  { label: 'Thirteen', input: '{"n":13}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object with an integer n, such as {"n":13}.')
  if (data.n < 1 || data.n > 10000) throw new Error('n must be from 1 to 10000.')
  return { n: data.n }
}

const digitSum = x => String(x).split('').reduce((a, d) => a + Number(d), 0)

export function buildTrace({ n }) {
  const sizes = new Map()
  let largest = 0
  const rows = () => [...sizes.entries()].sort((a, b) => a[0] - b[0]).map(([sum, size]) => ({ sum, size }))
  const snap = (extra = {}) => ({ rows: rows(), largest, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const sizes = new Map()'), pythonLine: P('sizes = {}'), snapshot: snap(),
    message: `Group 1 to ${n} by digit sum, then count the groups that reach the largest size.` }]
  for (let x = 1; x <= n; x++) {
    const s = digitSum(x)
    const isNew = !sizes.has(s)
    sizes.set(s, (sizes.get(s) || 0) + 1)
    frames.push({ phase: 'digits', activeLine: L('const s = digitSum'), pythonLine: P('s = digit_sum'), snapshot: snap({ current: s, number: x }),
      message: `${x} has digit sum ${s}; that group now has ${sizes.get(s)} member(s).` })
    if (isNew) frames.push({ phase: 'group', activeLine: L('sizes.set(s'), pythonLine: P('sizes[s] = sizes.get'), snapshot: { ...snap({ current: s, number: x }), sizes: Object.fromEntries(sizes) },
      message: `Digit sum ${s} is new, so it opens a group with ${x} as its first member.` })
    if (sizes.get(s) > largest) {
      largest = sizes.get(s)
      frames.push({ phase: 'track', activeLine: L('if (sizes.get(s) > largest)'), pythonLine: P('if sizes[s] > largest'), snapshot: snap({ current: s, number: x }),
        message: `Group ${s} is the largest so far, with ${largest} member(s).` })
    }
  }
  const result = [...sizes.values()].filter(v => v === largest).length
  frames.push({ phase: 'done', activeLine: L('return [...sizes.values()]'), pythonLine: P('return sum'), snapshot: snap({ result }),
    message: `${result} group(s) reach the largest size of ${largest}.`, result })
  return { input: { n }, result, frames }
}

export const code = `function countLargestGroup(n) {
  const sizes = new Map()
  let largest = 0
  for (let x = 1; x <= n; x++) {
    const s = digitSum(x)
    sizes.set(s, (sizes.get(s) || 0) + 1)
    if (sizes.get(s) > largest) largest = sizes.get(s)
  }
  return [...sizes.values()].filter(v => v === largest).length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }

export const python = `def count_largest_group(n):
    sizes = {}
    largest = 0
    for x in range(1, n + 1):
        s = digit_sum(x)
        sizes[s] = sizes.get(s, 0) + 1
        if sizes[s] > largest:
            largest = sizes[s]
    return sum(1 for v in sizes.values() if v == largest)
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
