const TOP = 31
const isPowerOfTwo = v => Number.isInteger(v) && v > 0 && (v & (v - 1)) === 0
const exponentOf = v => 31 - Math.clz32(v)

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and target.')
  const { nums, target } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must be an array of 1 to 12 powers of two.')
  if (nums.some(v => !isPowerOfTwo(v) || v > 1024)) throw new Error('Each element is a power of two from 1 to 1024.')
  if (!Number.isInteger(target) || target < 1 || target > 1024) throw new Error('target must be an integer from 1 to 1024.')
  return { nums, target }
}

export function buildTrace({ nums, target }) {
  const cnt = Array(TOP + 2).fill(0)
  for (const v of nums) cnt[exponentOf(v)]++
  const frames = []
  let ops = 0
  const frame = (phase, line, bit, message) => frames.push({ phase, activeLine: line, bit, cnt: [...cnt], ops, message })
  frame('start', L('count the copies'), -1, `Count the copies of each power of two. Target ${target}.`)
  const total = nums.reduce((a, b) => a + b, 0)
  if (total < target) {
    frame('fail', L('return -1'), -1, `The sum ${total} is below the target, so no subsequence can reach it.`)
    return { input: { nums, target }, result: -1, frames }
  }
  for (let b = 0; b <= TOP - 1; b++) {
    if ((target >> b) & 1) {
      if (cnt[b] === 0) {
        let j = b + 1
        while (j <= TOP && cnt[j] === 0) j++
        if (j > TOP) {
          frame('fail', L('return -1'), b, `No larger power of two is left to split for bit ${b}.`)
          return { input: { nums, target }, result: -1, frames }
        }
        ops += j - b
        cnt[j]--
        for (let p = b; p < j; p++) cnt[p]++
        frame('split', L('split it'), b, `Split ${2 ** j} down to ${2 ** b}, costing ${j - b} operations.`)
      }
      cnt[b]--
      frame('use', L('use one copy'), b, `Target has bit ${b}; one copy of ${2 ** b} is used.`)
    }
    const carry = Math.floor(cnt[b] / 2)
    if (carry > 0) {
      cnt[b + 1] += carry
      frame('carry', L('pair up the leftover'), b, `${cnt[b]} leftover copies of ${2 ** b} make ${carry} pair(s) worth ${2 ** (b + 1)} for free.`)
    }
  }
  frame('done', L('return ops'), -1, `Minimum operations: ${ops}.`)
  return { input: { nums, target }, result: ops, frames }
}

export const code = `minimum operations to form a subsequence summing to target
  if the sum of nums is less than target then return -1
  count the copies of each power of two in cnt
  set ops to 0
  for each bit b from 0 to 30 do
    if target has bit b set then
      if cnt[b] is zero then
        find the smallest j above b with cnt[j] positive, or return -1
        add j minus b to ops, remove one copy of 2^j, and split it into one copy of each 2^p for p from b to j minus 1
      use one copy of 2^b
    pair up the leftover copies of 2^b and carry each pair to cnt[b + 1]
  return ops`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def min_operations(nums, target):
    if sum(nums) < target:
        return -1
    cnt = [0] * 33
    for v in nums:
        cnt[v.bit_length() - 1] += 1
    ops = 0
    for b in range(32):
        if (target >> b) & 1:
            if cnt[b] == 0:
                j = b + 1
                while j < 32 and cnt[j] == 0:
                    j += 1
                if j == 32:
                    return -1
                ops += j - b
                cnt[j] -= 1
                for p in range(b, j):
                    cnt[p] += 1
            cnt[b] -= 1
        cnt[b + 1] += cnt[b] // 2
    return ops
`
