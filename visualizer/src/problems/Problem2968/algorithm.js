export const MAX_LENGTH = 24

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} entries in this visualization.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 1 || value > 1e9) throw new Error('Each entry of nums is an integer from 1 to 1000000000.')
  }
  if (!Number.isInteger(k) || k < 0 || k > 1e14) throw new Error('k is an integer from 0 to 100000000000000.')
  return { nums, k }
}

export const code = `sort the values so equal targets gather into a contiguous block
build prefix sums to price any block in constant time
for each right end r of the window
  while the window is too expensive
    take the median of the window as the target
    moves below the target = target × count − their sum
    moves above the target = their sum − target × count
    if the total exceeds k, drop the leftmost value
  the window fits, so its length is a possible answer
return the longest window that fit`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def max_frequency_score(nums, k):
    nums = sorted(nums)
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)

    def moves(l, r):
        m = (l + r) // 2
        below = nums[m] * (m - l) - (prefix[m] - prefix[l])
        above = (prefix[r + 1] - prefix[m + 1]) - nums[m] * (r - m)
        return below + above

    best = l = 0
    for r in range(len(nums)):
        while moves(l, r) > k:
            l += 1
        best = max(best, r - l + 1)
    return best
`

const P = s => {
  const index = python.trim().split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Values close together sit side by side.' },
  { id: 'prefix', label: 'Prefix', description: 'Running totals price any block quickly.' },
  { id: 'extend', label: 'Extend', description: 'The right end takes in the next value.' },
  { id: 'median', label: 'Median', description: 'The middle value of the window is the cheapest target.' },
  { id: 'cost', label: 'Cost', description: 'Total moves needed to level the window.' },
  { id: 'shrink', label: 'Shrink', description: 'Too expensive, so the left end moves right.' },
  { id: 'fit', label: 'Fit', description: 'The window is within budget.' },
  { id: 'done', label: 'Result', description: 'Report the longest window.' },
]

export function buildTrace({ nums, k }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const frames = []
  const prefix = [0]
  let l = 0, r = -1, best = 0, bestRange = null
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, l, r, m: null, below: null, above: null, cost: null, reads: [], prefix: [...prefix], best, bestRange, ...extra,
  })

  push('sort', L('sort the values'), P('nums = sorted(nums)'), `Sorted, the values read ${sorted.join(', ')}. Any group worth levelling is now one contiguous block.`)
  sorted.forEach((value, i) => {
    prefix.push(prefix[i] + value)
    push('prefix', L('build prefix'), P('prefix.append'), `prefix[${i + 1}] = ${prefix[i]} + ${value} = ${prefix[i + 1]}.`, { prefixIndex: i + 1 })
  })

  const price = () => {
    const m = Math.floor((l + r) / 2)
    const target = sorted[m]
    const below = target * (m - l) - (prefix[m] - prefix[l])
    const above = (prefix[r + 1] - prefix[m + 1]) - target * (r - m)
    return { m, target, below, above, cost: below + above, reads: [l, m, m + 1, r + 1] }
  }

  for (r = 0; r < sorted.length; r++) {
    push('extend', L('for each right end'), P('for r in range'), `The right end moves to index ${r}, taking in the value ${sorted[r]}.`)
    while (true) {
      const p = price()
      push('median', L('take the median'), P('m = (l + r)'), `The window [${l}..${r}] has median index ${p.m}, so the target is ${p.target}.`, { m: p.m })
      push('cost', L('moves below'), P('return below + above'), `Lifting the lower values costs ${p.below}, lowering the upper values costs ${p.above}, for a total of ${p.cost} against a budget of ${k}.`, { m: p.m, below: p.below, above: p.above, cost: p.cost, reads: p.reads })
      if (p.cost <= k) {
        const length = r - l + 1
        const improved = length > best
        if (improved) { best = length; bestRange = [l, r] }
        push('fit', L('the window fits'), P('best = max'), improved ? `${p.cost} is within ${k}, so a block of ${length} can be levelled. That is the new best.` : `${p.cost} is within ${k}, but length ${length} does not beat the best of ${best}.`, { m: p.m, below: p.below, above: p.above, cost: p.cost, improved })
        break
      }
      push('shrink', L('drop the leftmost'), P('l += 1'), `${p.cost} is over ${k}. Drop the value ${sorted[l]} at index ${l}, the farthest from the rest on the low side.`, { m: p.m, below: p.below, above: p.above, cost: p.cost, dropped: l })
      l++
    }
  }
  r = sorted.length - 1
  const final = bestRange
  push('done', L('return the longest'), P('return best'), `The longest affordable block has ${best} value${best === 1 ? '' : 's'}: indices ${final[0]} to ${final[1]}, levelled onto ${sorted[Math.floor((final[0] + final[1]) / 2)]}.`, { l: final[0], r: final[1], m: Math.floor((final[0] + final[1]) / 2) })
  return { input: { nums, k }, sorted, result: best, frames }
}
