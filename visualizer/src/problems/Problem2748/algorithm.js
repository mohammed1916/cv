const MAX_LENGTH = 10
const MAX_VALUE = 9999

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[2,5,1,4]}.')
  if (data.nums.length < 2 || data.nums.length > MAX_LENGTH) throw new Error(`Use 2 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums }) {
  const seen = Array(10).fill(0)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set seen to ten zeros'), index: -1, seen: [...seen], gained: 0, total, message: 'No earlier numbers yet.' }]
  nums.forEach((x, j) => {
    const last = x % 10
    let gained = 0
    for (let d = 1; d <= 9; d++) if (gcd(d, last) === 1) gained += seen[d]
    total += gained
    frames.push({ phase: 'pair', activeLine: L('if d and last are coprime'), index: j, seen: [...seen], gained, total, message: `${x} (last digit ${last}) forms ${gained} beautiful pair(s) with earlier numbers.` })
    seen[Number(String(x)[0])] += 1
    frames.push({ phase: 'record', activeLine: L('count the first digit'), index: j, seen: [...seen], gained, total, message: `Recorded the first digit of ${x}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, seen: [...seen], gained: 0, total, message: `Beautiful pairs: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = `count beautiful pairs
  set seen to ten zeros, one per first digit
  set total to 0
  for each number x in nums in order
    set last to the last digit of x
    for each first digit d from 1 to 9
      if d and last are coprime then add seen[d] to total
    count the first digit of x in seen
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful_pairs(nums):
    from math import gcd
    seen = [0] * 10
    total = 0
    for x in nums:
        last = x % 10
        for d in range(1, 10):
            if gcd(d, last) == 1:
                total += seen[d]
        seen[int(str(x)[0])] += 1
    return total
`
