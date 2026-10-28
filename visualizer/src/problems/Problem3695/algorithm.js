export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and swaps.')
  if (Object.keys(input).sort().join(',') !== 'nums,swaps') throw new Error('The object must have exactly the keys nums and swaps.')
  const { nums, swaps } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10) throw new Error('nums must have 2 to 10 integers for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 99)) throw new Error('Each nums value is an integer from 1 to 99 here.')
  if (!Array.isArray(swaps) || swaps.length > 12) throw new Error('swaps must be an array of at most 12 pairs.')
  const seen = new Set()
  for (const pair of swaps) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger) || pair[0] < 0 || pair[0] >= pair[1] || pair[1] >= nums.length) {
      throw new Error('Each swap is [p, q] with 0 <= p < q < nums.length.')
    }
    if (seen.has(pair.join(','))) throw new Error('Each swap pair may appear only once.')
    seen.add(pair.join(','))
  }
  return { nums, swaps }
}

export function buildTrace(input) {
  const { nums, swaps } = input
  const n = nums.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => {
    let at = x
    while (parent[at] !== at) { parent[at] = parent[parent[at]]; at = parent[at] }
    return at
  }
  const frames = [{ phase: 'start', activeLine: L('start with every index in its own group'), group: null, total: null, result: null, message: 'Each index starts in its own group.' }]
  for (const [p, q] of swaps) {
    parent[find(p)] = find(q)
    frames.push({ phase: 'join', activeLine: L('join the groups of p and q'), group: null, total: null, result: null, message: `Swap [${p}, ${q}] joins their groups.` })
  }
  const groups = new Map()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(i)
  }
  let total = 0
  for (const indices of groups.values()) {
    const evens = indices.filter(i => i % 2 === 0).length
    const values = indices.map(i => nums[i]).sort((a, b) => b - a)
    const top = values.slice(0, evens).reduce((a, b) => a + b, 0)
    const rest = values.slice(evens).reduce((a, b) => a + b, 0)
    total += top - rest
    frames.push({ phase: 'group', activeLine: L('put the largest e values on the even indices'), group: indices, total, result: null, message: `Group [${indices.join(', ')}] has ${evens} even index(es). Running total: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the even sum minus the odd sum'), group: null, total, result: total, message: `Best alternating sum: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum alternating sum after allowed swaps
  start with every index in its own group
  for each swap [p, q]
    join the groups of p and q
  for each group of indices
    let e be the number of even indices in the group
    sort the group's values from largest to smallest
    put the largest e values on the even indices
    put the rest of the values on the odd indices
  return the even sum minus the odd sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_alternating_sum(nums, swaps):
    n = len(nums)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for p, q in swaps:
        parent[find(p)] = find(q)
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    total = 0
    for indices in groups.values():
        evens = sum(1 for i in indices if i % 2 == 0)
        values = sorted((nums[i] for i in indices), reverse=True)
        total += sum(values[:evens]) - sum(values[evens:])
    return total
`
