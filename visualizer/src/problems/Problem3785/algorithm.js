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
  for (let i = 0; i < n; i++) {
    count.set(nums[i], (count.get(nums[i]) || 0) + 1)
    count.set(forbidden[i], (count.get(forbidden[i]) || 0) + 1)
    frames.push({ pythonLine: pyLine('count[nums[i]] = count.get'), phase: 'count', activeLine: L('count each value seen'), at: i, conflict: false, total: null, most: null, message: `Count ${nums[i]} from nums and ${forbidden[i]} from forbidden at index ${i}.` })
  }
  for (const [value, c] of count) {
    frames.push({ pythonLine: pyLine('if count[value] > n'), phase: 'limit', activeLine: L('if a value appears more than n'), at: -1, conflict: false, total: null, most: null, message: `${value} appears ${c} times in both arrays together; n is ${n}.` })
    if (c > n) {
      frames.push({ pythonLine: pyLine('return -1'), phase: 'done', activeLine: L('return -1'), at: -1, conflict: false, total: null, most: null, result: -1, message: `${value} cannot avoid every forbidden position. Result -1.` })
      return { input: { nums, forbidden }, result: -1, frames }
    }
  }
  const conflict = new Map()
  let total = 0
  for (let i = 0; i < n; i++) {
    const hit = nums[i] === forbidden[i]
    if (hit) {
      conflict.set(nums[i], (conflict.get(nums[i]) || 0) + 1)
      total++
    }
    frames.push({ pythonLine: pyLine('if nums[i] == forbidden[i]'), phase: 'conflict', activeLine: L('nums at i equals forbidden at i'), at: i, conflict: hit, total, most: null, message: hit ? `Index ${i} holds forbidden value ${nums[i]}; conflicts so far: ${total}.` : `Index ${i} is safe.` })
  }
  if (total === 0) {
    frames.push({ pythonLine: pyLine('return 0'), phase: 'done', activeLine: L('return 0'), at: -1, conflict: false, total, most: null, result: 0, message: 'No index conflicts. Result 0.' })
    return { input: { nums, forbidden }, result: 0, frames }
  }
  const most = Math.max(...conflict.values())
  frames.push({ pythonLine: pyLine('most = max(conflict.values())'), phase: 'tally', activeLine: L('largest conflict count'), at: -1, conflict: false, total, most, message: `Conflicts total ${total}; the largest value group has ${most}.` })
  const result = Math.max(Math.floor((total + 1) / 2), most)
  frames.push({ pythonLine: pyLine('return max('), phase: 'done', activeLine: L('return the larger of'), at: -1, conflict: false, total, most, result, message: `max(ceil(${total} / 2), ${most}) = ${result}.` })
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
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
const pyLine = s => python.split('\n').findIndex(l => l.includes(s)) + 1
