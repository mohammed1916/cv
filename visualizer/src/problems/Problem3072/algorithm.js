import { queryChain, updateChain } from '../../components/shared/fenwickModel.js'

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12) throw new Error('Enter 3 to 12 distinct integers from 1 to 50.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Each value is an integer from 1 to 50.')
  if (new Set(nums).size !== nums.length) throw new Error('All values must be distinct.')
  return nums
}

export function buildTrace(nums) {
  const m = nums.length
  const rank = new Map([...nums].sort((a, b) => a - b).map((v, i) => [v, i + 1]))
  const cells = [Array(m + 1).fill(0), Array(m + 1).fill(0)]
  const logs = []
  const update = (t, i) => {
    const chain = updateChain(i, m)
    for (const c of chain) cells[t][c] += 1
    return { type: 'update', index: i, value: 1, chain, mode: 'sum' }
  }
  const query = (t, i) => {
    const chain = queryChain(i)
    const parts = chain.map(c => ({ cell: c, value: cells[t][c] }))
    const total = parts.reduce((s, p) => s + p.value, 0)
    return { type: 'query', index: i, chain, parts, total, mode: 'sum' }
  }
  const arrays = [[nums[0]], [nums[1]]]
  const snapshot = (phase, extra) => ({
    phase, arr1: arrays[0].slice(), arr2: arrays[1].slice(),
    tree1: cells[0].slice(1), tree2: cells[1].slice(1), ops1: logs.filter(o => o.tree === 0).map(o => o.op), ops2: logs.filter(o => o.tree === 1).map(o => o.op),
    ...extra,
  })
  logs.push({ tree: 0, op: update(0, rank.get(nums[0])) }, { tree: 1, op: update(1, rank.get(nums[1])) })
  const frames = [snapshot('start', { index: null, value: null, g1: null, g2: null, target: null, activeLine: L('set arr1 to'), message: `arr1 starts with ${nums[0]} and arr2 with ${nums[1]}.` })]
  for (let i = 2; i < m; i++) {
    const x = nums[i], r = rank.get(x)
    logs.length = 0
    const q1 = query(0, r), q2 = query(1, r)
    const g1 = arrays[0].length - q1.total
    const g2 = arrays[1].length - q2.total
    logs.push({ tree: 0, op: q1 }, { tree: 1, op: q2 })
    const toFirst = g1 > g2 || (g1 === g2 && arrays[0].length <= arrays[1].length)
    const t = toFirst ? 0 : 1
    logs.push({ tree: t, op: update(t, r) })
    arrays[t].push(x)
    const why = g1 !== g2 ? `${g1} greater in arr1 vs ${g2} in arr2` : `tie (${g1} each); the shorter array takes it`
    frames.push(snapshot('place', { index: i, value: x, g1, g2, target: t + 1, activeLine: L('append x to arr1'), message: `${x}: ${why}, so it goes to arr${t + 1}.` }))
  }
  const result = [...arrays[0], ...arrays[1]]
  frames.push(snapshot('done', { index: null, value: null, g1: null, g2: null, target: null, activeLine: L('return arr1 followed'), message: `Result: [${result.join(', ')}].`, result }))
  return { input: nums, result, frames }
}

export const code = `distribute the values into arr1 and arr2
  set arr1 to [nums[0]] and arr2 to [nums[1]]
  for each later value x in order
    set g1 to the number of values in arr1 that are greater than x
    set g2 to the number of values in arr2 that are greater than x
    if g1 is greater than g2, or g1 equals g2 and arr1 is not longer than arr2 then
      append x to arr1
    otherwise
      append x to arr2
  return arr1 followed by arr2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def result_array(nums):
    m = len(nums)
    rank = {v: i + 1 for i, v in enumerate(sorted(nums))}
    t1 = [0] * (m + 1)
    t2 = [0] * (m + 1)

    def add(t, i):
        while i <= m:
            t[i] += 1
            i += i & -i

    def prefix(t, i):
        total = 0
        while i > 0:
            total += t[i]
            i -= i & -i
        return total

    arr1, arr2 = [nums[0]], [nums[1]]
    add(t1, rank[nums[0]])
    add(t2, rank[nums[1]])
    for x in nums[2:]:
        r = rank[x]
        g1 = len(arr1) - prefix(t1, r)
        g2 = len(arr2) - prefix(t2, r)
        if g1 > g2 or (g1 == g2 and len(arr1) <= len(arr2)):
            arr1.append(x)
            add(t1, r)
        else:
            arr2.append(x)
            add(t2, r)
    return arr1 + arr2
`
