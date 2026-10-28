const MOD = 1000000007
const MAX_LENGTH = 12
const MAX_VALUE = 1000

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return arr
}

export const code = `sum of good subsequences(nums)
  set total to 0
  set the count and sum tables to empty, keyed by the value that ends a subsequence
  for each value x in nums, in order
    set ways to 1 and weight to x, which counts the subsequence that is just x
    for each neighbour value y that is x minus 1 or x plus 1
      add the count of y to ways
      add the sum of y plus x times the count of y to weight
    add ways to the count of x
    add weight to the sum of x
    add weight to total
  return total, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(nums) {
  const count = new Map()
  const sums = new Map()
  const get = (map, key) => map.get(key) ?? 0
  let total = 0
  const frames = [{ phase: 'start', index: -1, value: null, ways: 0, total: 0, activeLine: L('set total to 0'), message: 'No good subsequence has been counted yet.' }]
  nums.forEach((x, index) => {
    let ways = 1
    let weight = x
    for (const y of [x - 1, x + 1]) {
      ways += get(count, y)
      weight += get(sums, y) + x * get(count, y)
    }
    ways %= MOD
    weight %= MOD
    count.set(x, (get(count, x) + ways) % MOD)
    sums.set(x, (get(sums, x) + weight) % MOD)
    total = (total + weight) % MOD
    frames.push({ phase: 'extend', index, value: x, ways, weight, total, activeLine: L('add ways to the count'), message: `Value ${x} ends ${ways} good subsequences here, with a sum of ${weight}. Total so far: ${total}.` })
  })
  frames.push({ phase: 'done', index: nums.length, value: null, ways: 0, total, activeLine: L('return total'), message: `Sum of all good subsequences: ${total}.` })
  return { input: nums, result: total, frames }
}

export const python = `def sum_of_good_subsequences(nums):
    MOD = 1000000007
    count = {}
    sums = {}
    total = 0
    for x in nums:
        ways = 1
        weight = x
        for y in (x - 1, x + 1):
            ways += count.get(y, 0)
            weight += sums.get(y, 0) + x * count.get(y, 0)
        count[x] = (count.get(x, 0) + ways) % MOD
        sums[x] = (sums.get(x, 0) + weight) % MOD
        total = (total + weight) % MOD
    return total
`
