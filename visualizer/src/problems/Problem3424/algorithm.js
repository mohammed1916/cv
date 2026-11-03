export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr) || !Array.isArray(input.brr)) throw new Error('Use an object with arr, brr and k.')
  const { arr, brr, k } = input
  if (arr.length < 1 || arr.length > 8 || arr.length !== brr.length) throw new Error('arr and brr need the same length, from 1 to 8.')
  if (![...arr, ...brr].every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers between -100 and 100.')
  if (!Number.isInteger(k) || k < 0 || k > 1000) throw new Error('k is an integer from 0 to 1000.')
  return { arr, brr, k }
}

const gaps = (xs, ys) => xs.reduce((sum, x, i) => sum + Math.abs(x - ys[i]), 0)

export function buildTrace({ arr, brr, k }) {
  const frames = []
  const frame = fields => frames.push({ a: arr, b: brr, at: -1, ...fields })

  frame({ pythonLine: 2, phase: 'start', activeLine: L('cost without any split'), message: `Compare arr and brr position by position. Splitting costs ${k} each time.` })
  const direct = gaps(arr, brr)
  frame({ pythonLine: 2, phase: 'direct', activeLine: L('cost without any split'), at: -1, message: `Matching positions directly costs ${direct}.` })

  const sa = [...arr].sort((x, y) => x - y)
  const sb = [...brr].sort((x, y) => x - y)
  frame({ pythonLine: 3, phase: 'sort', activeLine: L('sort both arrays'), a: sa, b: sb, message: 'Sorted copies: pairing equal ranks is the cheapest way to match values.' })

  const matched = gaps(sa, sb)
  frame({ pythonLine: 4, phase: 'match', activeLine: L('best pairing'), a: sa, b: sb, message: `Pairing the sorted values costs ${matched} in element changes.` })

  const split = k + matched
  const result = Math.min(direct, split)
  frame({ pythonLine: 5, phase: 'choose', activeLine: L('one split and rearrange'), a: sa, b: sb, message: `One split and rearrange costs ${split}; the direct route costs ${direct}.` })

  frame({ pythonLine: 6, phase: 'done', activeLine: L('return the smaller'), a: arr, b: brr, message: `Minimum total cost is ${result}.` })
  return { input: { arr, brr, k }, result, direct, split, frames }
}

export const code = `cheapest way to align arr with brr
  cost without any split is the sum of position gaps
  sort both arrays
  best pairing cost is the sum of sorted gaps
  one split and rearrange costs k plus the paired gaps
  return the smaller of the two`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_identical(arr, brr, k):
    direct = sum(abs(x - y) for x, y in zip(arr, brr))
    sa = sorted(arr)
    sb = sorted(brr)
    matched = sum(abs(x - y) for x, y in zip(sa, sb))
    split = k + matched
    return min(direct, split)
`
