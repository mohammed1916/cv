export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 10) throw new Error('nums holds 1 to 10 integers.')
  if (!input.nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Each value is an integer from 1 to 50.')
  if (!Number.isInteger(input.limit) || input.limit < 0 || input.limit > 50) throw new Error('limit is an integer from 0 to 50.')
  return { nums: input.nums, limit: input.limit }
}

export const code = `function lexicographicallySmallest(nums, limit) {
  const order = nums.map((v, i) => i).sort((p, q) => nums[p] - nums[q])
  const result = [...nums]
  let group = []
  const flush = () => {
    const positions = group.map(i => i).sort((p, q) => p - q)
    const values = group.map(i => nums[i]).sort((p, q) => p - q)
    positions.forEach((pos, k) => { result[pos] = values[k] })
    group = []
  }
  for (const i of order) {
    if (group.length && nums[i] - nums[group[group.length - 1]] > limit) flush()
    group.push(i)
  }
  if (group.length) flush()
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def lexicographically_smallest(nums, limit):
    order = sorted(range(len(nums)), key=lambda i: nums[i])
    result = list(nums)
    group = []

    def flush():
        positions = sorted(group)
        values = sorted(nums[i] for i in group)
        for pos, value in zip(positions, values):
            result[pos] = value

    for i in order:
        if group and nums[i] - nums[group[-1]] > limit:
            flush()
            group = []
        group.append(i)
    if group:
        flush()
    return result
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// Values that differ by at most limit can swap, so sorted neighbours chain into groups. Each group's values
// are written back into its positions in ascending order.
export function buildTrace({ nums, limit }) {
  const n = nums.length
  const order = nums.map((_, i) => i).sort((p, q) => nums[p] - nums[q])
  const result = [...nums]
  const frames = []
  const snap = fields => frames.push({ nums, limit, result: [...result], group: [], groupId: -1, message: '', ...fields })
  snap({ phase: 'sort', activeLine: CL('const order = nums.map'), pythonLine: PL('order = sorted'), message: `Sort the indices by value; neighbours within ${limit} can swap.` })
  let group = []
  let groupId = 0
  const flush = () => {
    const positions = group.slice().sort((p, q) => p - q)
    const values = group.map(i => nums[i]).sort((p, q) => p - q)
    positions.forEach((pos, k) => { result[pos] = values[k] })
    snap({ phase: 'write', activeLine: CL('positions.forEach'), pythonLine: PL('for pos, value in zip'), group: positions, groupId, message: `Group ${groupId}: positions ${positions.join(', ')} receive values ${values.join(', ')} in order.` })
    group = []
    groupId += 1
  }
  for (const i of order) {
    if (group.length && nums[i] - nums[group[group.length - 1]] > limit) flush()
    group.push(i)
    snap({ phase: 'collect', activeLine: CL('group.push(i)'), pythonLine: PL('group.append(i)'), group: group.slice(), groupId, message: `Value ${nums[i]} at position ${i} joins group ${groupId}.` })
  }
  if (group.length) flush()
  snap({ phase: 'done', activeLine: CL('return result'), pythonLine: PL('return result'), group: [], groupId: -1, result: [...result], message: `The smallest array is [${result.join(', ')}].` })
  return { input: { nums, limit }, result: [...result], frames }
}
