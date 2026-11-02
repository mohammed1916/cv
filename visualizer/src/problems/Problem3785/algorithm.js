const INT = v => Number.isInteger(v) && v >= 1 && v <= 1000000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and forbidden.')
  const { nums, forbidden } = input
  if (!Array.isArray(nums) || !Array.isArray(forbidden)) throw new Error('nums and forbidden are arrays.')
  if (nums.length !== forbidden.length || nums.length < 1 || nums.length > 12) throw new Error('nums and forbidden have the same length, 1 to 12 in this visualization.')
  if (!nums.every(INT) || !forbidden.every(INT)) throw new Error('Every value is an integer from 1 to 1000000000.')
  return { nums, forbidden }
}

export function buildTrace({ nums, forbidden }) {
  const n = nums.length
  const frames = []
  const count = new Map()
  const conflict = new Map()
  const bad = []
  let total = 0
  // Snapshots keep each frame self-contained, so restart, back and seek show the same state.
  const snapCounts = () => [...count].map(([value, c]) => ({ value, count: c }))
  const snapGroups = () => [...conflict].map(([value, c]) => ({ value, count: c }))
  const frame = over => ({
    capacity: n, counts: snapCounts(), groups: snapGroups(), bad: bad.slice(),
    at: -1, conflict: false, checking: null, violator: null,
    total: null, most: null, half: null, chosen: null, result: undefined,
    ...over,
  })

  for (let i = 0; i < n; i++) {
    count.set(nums[i], (count.get(nums[i]) || 0) + 1)
    count.set(forbidden[i], (count.get(forbidden[i]) || 0) + 1)
    frames.push(frame({ pythonLine: pyLine('count[nums[i]] = count.get'), phase: 'count', activeLine: L('count each value seen'), at: i, message: `Count ${nums[i]} from nums and ${forbidden[i]} from forbidden at index ${i}.` }))
  }
  for (const [value, c] of count) {
    frames.push(frame({ pythonLine: pyLine('if count[value] > n'), phase: 'limit', activeLine: L('if a value appears more than n'), checking: value, message: `${value} appears ${c} times across both arrays; capacity is n = ${n}.` }))
    if (c > n) {
      frames.push(frame({ pythonLine: pyLine('return -1'), phase: 'done', activeLine: L('return -1'), violator: value, checking: value, result: -1, message: `${value} appears ${c} times, more than n = ${n}, so it cannot avoid every forbidden position. Result -1.` }))
      return { input: { nums, forbidden }, result: -1, frames }
    }
  }
  for (let i = 0; i < n; i++) {
    const hit = nums[i] === forbidden[i]
    if (hit) {
      conflict.set(nums[i], (conflict.get(nums[i]) || 0) + 1)
      bad.push(i)
      total++
    }
    frames.push(frame({ pythonLine: pyLine('if nums[i] == forbidden[i]'), phase: 'conflict', activeLine: L('nums at i equals forbidden at i'), at: i, conflict: hit, total, message: hit ? `Index ${i} holds forbidden value ${nums[i]}; conflicts so far: ${total}.` : `Index ${i} is safe.` }))
  }
  if (total === 0) {
    frames.push(frame({ pythonLine: pyLine('return 0'), phase: 'done', activeLine: L('return 0'), total, most: 0, half: 0, chosen: 'none', result: 0, message: 'No index conflicts. Result 0.' }))
    return { input: { nums, forbidden }, result: 0, frames }
  }
  const most = Math.max(...conflict.values())
  const half = Math.ceil(total / 2)
  frames.push(frame({ pythonLine: pyLine('most = max(conflict.values())'), phase: 'tally', activeLine: L('largest conflict count'), total, most, half, message: `Conflicts total ${total}, so ceil(${total} / 2) = ${half}; the largest value group has ${most}.` }))
  const result = Math.max(half, most)
  const chosen = most > half ? 'group' : 'half'
  const why = chosen === 'group'
    ? `the largest group (${most}) is bigger than half the conflicts`
    : `half the conflicts (${half}) is at least the largest group (${most})`
  frames.push(frame({ pythonLine: pyLine('return max((total'), phase: 'done', activeLine: L('return the larger of'), total, most, half, chosen, result, message: `max(${half}, ${most}) = ${result}; ${why}.` }))
  return { input: { nums, forbidden }, result, frames }
}

export const code = `minimum swaps to avoid forbidden values
  n is the length of nums
  count each value seen in nums and in forbidden together
  if a value appears more than n times in total then return -1
  for each index i where nums at i equals forbidden at i
    add one to the conflict count of that value and to the total
  if the total is 0 then return 0
  let most be the largest conflict count of any value
  return the larger of ceil(total / 2) and most`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def minimum_swaps(nums, forbidden):
    n = len(nums)
    count = {}
    for i in range(n):
        count[nums[i]] = count.get(nums[i], 0) + 1
        count[forbidden[i]] = count.get(forbidden[i], 0) + 1
    for value in count:
        if count[value] > n:
            return -1
    conflict = {}
    total = 0
    for i in range(n):
        if nums[i] == forbidden[i]:
            conflict[nums[i]] = conflict.get(nums[i], 0) + 1
            total += 1
    if total == 0:
        return 0
    most = max(conflict.values())
    return max((total + 1) // 2, most)


if __name__ == "__main__":
    print(minimum_swaps([1, 2, 3], [3, 2, 1]))
`

function pyLine(s) {
  const index = python.split('\n').findIndex(l => l.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
