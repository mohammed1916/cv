export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Each number must be an integer from -1000 to 1000 for the visualization.')
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1000 for the visualization.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const mod = x => ((x % k) + k) % k
  const setEarliest = (map, key, start) => {
    if (!map.has(key) || start < map.get(key)) map.set(key, start)
  }
  let plain = new Map()
  let negated = new Map()
  let best = 0
  const frames = []
  nums.forEach((v, r) => {
    const nextPlain = new Map()
    const nextNegated = new Map()
    for (const [c, l] of plain) {
      setEarliest(nextPlain, mod(c + v), l)
      setEarliest(nextNegated, mod(c - v), l)
    }
    for (const [c, l] of negated) setEarliest(nextNegated, mod(c + v), l)
    setEarliest(nextPlain, mod(v), r)
    setEarliest(nextNegated, mod(-v), r)
    plain = nextPlain
    negated = nextNegated
    const candidates = []
    if (plain.has(0)) candidates.push(r - plain.get(0) + 1)
    if (negated.has(0)) candidates.push(r - negated.get(0) + 1)
    if (candidates.length) best = Math.max(best, ...candidates)
    frames.push({ phase: 'extend', activeLine: L('set best to the larger of'), index: r, best, message: `Extend to index ${r}; the best valid length is ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, best, message: `Longest valid subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest subarray divisible by k with one negation(nums, k)
  set best to 0
  set plain and negated to empty maps from residue to earliest start
  for each index r in nums do
    set v to nums[r] and create empty maps nextPlain and nextNegated
    for each residue c and start l in plain do
      keep the earliest start for residue (c plus v) modulo k in nextPlain
      keep the earliest start for residue (c minus v) modulo k in nextNegated
    for each residue c and start l in negated do
      keep the earliest start for residue (c plus v) modulo k in nextNegated
    keep start r for residue v modulo k in nextPlain and residue (minus v) modulo k in nextNegated
    replace plain and negated with nextPlain and nextNegated
    if residue 0 is in plain or negated then
      set best to the larger of best and r minus the earliest start plus 1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_subarray_divisible_two_negation(nums, k):
    def put(d, key, start):
        if key not in d or start < d[key]:
            d[key] = start

    best = 0
    plain = {}
    negated = {}
    for r, v in enumerate(nums):
        next_plain = {}
        next_negated = {}
        for c, l in plain.items():
            put(next_plain, (c + v) % k, l)
            put(next_negated, (c - v) % k, l)
        for c, l in negated.items():
            put(next_negated, (c + v) % k, l)
        put(next_plain, v % k, r)
        put(next_negated, (-v) % k, r)
        plain = next_plain
        negated = next_negated
        candidates = []
        if 0 in plain:
            candidates.append(r - plain[0] + 1)
        if 0 in negated:
            candidates.append(r - negated[0] + 1)
        if candidates:
            best = max(best, max(candidates))
    return best
`
