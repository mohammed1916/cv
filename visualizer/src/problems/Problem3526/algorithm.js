export const phases = [
  { id: 'start', label: 'Read', description: 'Read nums and the queries.' },
  { id: 'query', label: 'Query', description: 'Take the next query in order.' },
  { id: 'assign', label: 'Assign', description: 'Overwrite one value; the change persists.' },
  { id: 'xor', label: 'XOR', description: 'Fold each value in the range into a running XOR.' },
  { id: 'reverse', label: 'Reverse', description: 'Swap the outermost unswapped pair and move inward.' },
  { id: 'done', label: 'Result', description: 'Return the XOR answers in encounter order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums has 1 to 8 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error('Each value is an integer from 0 to 15.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 entries.')
  const n = nums.length
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || ![1, 2, 3].includes(q[0])) throw new Error('Each query is [1, index, value], [2, left, right] or [3, left, right].')
    const [kind, a, b] = q
    if (kind === 1) {
      if (!Number.isInteger(a) || a < 0 || a >= n || !Number.isInteger(b) || b < 0 || b > 15) throw new Error('Assignment needs a valid index and a value from 0 to 15.')
    } else if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b >= n || a > b) {
      throw new Error('Range queries need 0 <= left <= right < length.')
    }
  }
  return { nums: nums.slice(), queries: queries.map(q => q.slice()) }
}

export const code = [
  'range xor queries with subarray reversals',
  '  results = empty list',
  '  for each query [type, a, b] in order',
  '    if type is 1, set nums[a] = b',
  '    if type is 2, acc = XOR of nums[a..b], append acc to results',
  '    if type is 3, reverse nums[a..b] in place by swapping inward pairs',
  '  return results',
].map((text, index) => ({ line: index + 1, text }))

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

export function buildTrace({ nums: start, queries }) {
  const nums = start.slice()
  const results = []
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, nums: nums.slice(), queries, query: -1, range: null, at: -1, acc: null, results: results.slice(), ...extra,
  })
  push('start', L('range xor queries'), P('def range_xor'), `Read ${nums.length} values and ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'}.`)
  queries.forEach((q, qi) => {
    const [kind, a, b] = q
    push('query', L('for each query'), P('for kind, a, b'), `Query ${qi}: ${kind === 1 ? `set index ${a} to ${b}` : kind === 2 ? `XOR of [${a}, ${b}]` : `reverse [${a}, ${b}]`}.`, { query: qi, range: [a, b] })
    if (kind === 1) {
      nums[a] = b
      push('assign', L('set nums[a] = b'), P('nums[a] = b'), `nums[${a}] becomes ${b}. The change persists for later queries.`, { query: qi, range: [a, a], at: a })
    } else if (kind === 2) {
      let acc = 0
      push('xor', L('acc = XOR'), P('acc = 0'), 'Start the running XOR at 0.', { query: qi, range: [a, b], acc })
      for (let i = a; i <= b; i++) {
        acc ^= nums[i]
        push('xor', L('acc = XOR'), P('acc ^= nums[i]'), `XOR in nums[${i}] = ${nums[i]}; the running value is ${acc}.`, { query: qi, range: [a, b], at: i, acc })
      }
      results.push(acc)
      push('xor', L('append acc'), P('results.append(acc)'), `Append ${acc} to the results.`, { query: qi, range: [a, b], acc })
    } else {
      let i = a
      let j = b
      while (i < j) {
        const left = nums[i]
        const right = nums[j]
        nums[i] = right
        nums[j] = left
        push('reverse', L('swapping inward pairs'), P('nums[i], nums[j] ='), `Swap nums[${i}] = ${left} with nums[${j}] = ${right}.`, { query: qi, range: [a, b], at: i, pairEnd: j })
        i++
        j--
      }
      push('reverse', L('swapping inward pairs'), P('i += 1'), `The range [${a}, ${b}] is now reversed.`, { query: qi, range: [a, b], at: -1 })
    }
  })
  push('done', L('return results'), P('return results'), `Answers in order: [${results.join(', ')}].`, { result: results.slice(), query: -1, range: null, at: -1, results: results.slice() })
  return { input: { nums: start, queries }, result: results, frames }
}

export const python = `def range_xor_with_reversals(nums, queries):
    nums = list(nums)
    results = []
    for kind, a, b in queries:
        if kind == 1:
            nums[a] = b
        elif kind == 2:
            acc = 0
            for i in range(a, b + 1):
                acc ^= nums[i]
            results.append(acc)
        elif kind == 3:
            i, j = a, b
            while i < j:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
                j -= 1
    return results
`
