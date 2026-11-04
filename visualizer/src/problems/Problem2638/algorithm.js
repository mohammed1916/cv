// Pseudocode lines are looked up by a phrase, so a renamed line fails loudly instead of pointing at the wrong text.
const CODE = [
  'function countKFree(nums, k) {',
  '  const present = new Set(nums) // put every value into a set',
  '  let total = 1',
  '  for (const v of [...nums].sort((a, b) => a - b)) {',
  '    if (present.has(v - k)) continue // if v minus k is in present, skip v',
  '    let skip = 1, take = 0 // set skip to 1 and take to 0 before v',
  '    let x = v',
  '    while (present.has(x)) {',
  '      [skip, take] = [skip + take, skip] // set skip and take to skip plus take',
  '      x += k',
  '    }',
  '    total *= skip + take // multiply total by skip plus take',
  '  }',
  '  return total // return total',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const L = phrase => {
  const found = CODE.findIndex(c => c.includes(phrase))
  if (found < 0) throw new Error(`Missing code line for "${phrase}"`)
  return found + 1
}

export const python = `def count_k_free(nums, k):
    present = set(nums)
    total = 1
    for v in sorted(nums):
        if v - k in present:
            continue
        skip, take = 1, 0
        x = v
        while x in present:
            skip, take = skip + take, skip
            x += k
        total *= skip + take
    return total
`

const pythonLines = python.trim().split('\n')
const PY = phrase => {
  const found = pythonLines.findIndex(t => t.includes(phrase))
  if (found < 0) throw new Error(`Missing Python line for "${phrase}"`)
  return found + 1
}

export const phases = [
  { id: 'start', label: 'Set up', description: 'Store the values and start the total at one.' },
  { id: 'skip', label: 'Not a start', description: 'A value k below is present, so this value belongs to that chain.' },
  { id: 'chain', label: 'Chain start', description: 'Begin counting a chain of values spaced k apart.' },
  { id: 'extend', label: 'Extend', description: 'Choose take or skip for the next value in the chain.' },
  { id: 'multiply', label: 'Combine', description: 'Multiply the chain count into the total.' },
  { id: 'done', label: 'Result', description: 'Report the total count.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length > 12) throw new Error('nums holds at most 12 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 40)) throw new Error('Each value is an integer from 1 to 40.')
  if (new Set(nums).size !== nums.length) throw new Error('The values must be distinct.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums: [...nums], k }
}

export function buildTrace({ nums, k }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const present = new Set(nums)
  const chains = []
  const frames = []
  let total = 1
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase,
    activeLine: L(line),
    pythonLine: PY(py),
    message,
    k,
    sorted,
    chains: chains.map(c => ({ ...c, values: [...c.values] })),
    total,
    value: extra.value ?? null,
    current: extra.current ?? null,
  })

  push('start', 'put every value into a set', 'present = set(nums)', `${sorted.length} value${sorted.length === 1 ? '' : 's'}; two values conflict when they are exactly ${k} apart.`)
  for (const v of sorted) {
    if (present.has(v - k)) {
      push('skip', 'if v minus k is in present', 'if v - k in present', `${v} has ${v - k} in the set, so it is not the start of a chain.`, { value: v })
      continue
    }
    let skip = 1
    let take = 0
    let x = v
    const members = []
    push('chain', 'set skip to 1 and take to 0', 'skip, take = 1, 0', `${v} starts a chain. The empty choice so far gives skip 1 and take 0.`, { value: v, current: { members: [], skip, take } })
    while (present.has(x)) {
      members.push(x)
      const previousSkip = skip
      skip = skip + take
      take = previousSkip
      push('extend', 'set skip and take to skip plus take', 'skip, take = skip + take, skip', `${x} is in the chain. Taking it needs the previous value skipped: skip ${skip}, take ${take}.`, { value: x, current: { members: [...members], skip, take } })
      x += k
    }
    const ways = skip + take
    chains.push({ values: members, ways })
    total *= ways
    push('multiply', 'multiply total by skip plus take', 'total *= skip + take', `Chain ${members.join(', ')} allows ${ways} choices; total becomes ${total}.`, { current: null })
  }
  push('done', 'return total', 'return total', `${total} k-free subset${total === 1 ? '' : 's'}, counting the empty one.`)
  return { input: { nums: [...nums], k }, result: total, frames, chains }
}
