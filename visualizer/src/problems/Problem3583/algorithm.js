const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || data.nums.length < 3 || data.nums.length > 30) throw new Error('Use an array nums of 3 to 30 integers.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Values are integers from 0 to 100.')
  return { nums: data.nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const right = new Map()
  for (const x of nums) right.set(x, (right.get(x) || 0) + 1)
  const left = new Map()
  const entries = m => [...m].sort((a, b) => a[0] - b[0])
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set the right counts'), index: -1, left: [], right: entries(right), contribution: 0, total: 0, message: 'Start with every value counted on the right and none on the left.' }]
  for (let j = 0; j < n; j++) {
    const x = nums[j]
    right.set(x, right.get(x) - 1)
    const target = 2 * x
    const contribution = (left.get(target) || 0) * (right.get(target) || 0)
    total += contribution
    frames.push({ phase: 'scan', activeLine: L('add the left count of twice'), index: j, left: entries(left), right: entries(right), target, contribution, total, message: `Middle value ${x} needs ${target} on both sides: ${left.get(target) || 0} on the left and ${right.get(target) || 0} on the right, adding ${contribution}.` })
    left.set(x, (left.get(x) || 0) + 1)
  }
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return total modulo'), index: -1, left: entries(left), right: entries(right), contribution: 0, total: result, result, message: `Special triplets modulo 1000000007: ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `count special triplets with i less than j less than k
  set the right counts to the count of every value
  set the left counts and total to empty and zero
  for each index j from 0 to n minus 1
    remove nums at j from the right counts
    add the left count of twice nums at j times the right count of twice nums at j to total
    add nums at j to the left counts
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_special_triplets(nums):
    MOD = 10 ** 9 + 7
    left = {}
    right = {}
    for x in nums:
        right[x] = right.get(x, 0) + 1
    total = 0
    for x in nums:
        right[x] -= 1
        total += left.get(2 * x, 0) * right.get(2 * x, 0)
        left[x] = left.get(x, 0) + 1
    return total % MOD
`
