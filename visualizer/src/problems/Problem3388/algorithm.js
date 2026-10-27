export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (nums.length < 3 || nums.length > 10) throw new Error('nums must have 3 to 10 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 3)) throw new Error('Each value is an integer from 0 to 3.')
  return { nums }
}

const isPrefix = (short, long) => short.length <= long.length && short.every((v, k) => long[k] === v)

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let count = 0
  frames.push({ phase: 'start', activeLine: L('set count to 0'), i: -1, j: -1, reason: '', count, message: `Try every split into three non-empty parts of ${n} values.` })
  for (let i = 1; i <= n - 2; i++) {
    for (let j = i + 1; j <= n - 1; j++) {
      const a = nums.slice(0, i), b = nums.slice(i, j), c = nums.slice(j)
      const first = isPrefix(a, b), second = isPrefix(b, c)
      const beautiful = first || second
      if (beautiful) count++
      const reason = first ? 'first part is a prefix of the second' : second ? 'second part is a prefix of the third' : 'neither prefix condition holds'
      frames.push({ phase: beautiful ? 'beautiful' : 'split', activeLine: L('if a is a prefix of b'), i, j, reason, count, message: `Split at ${i} and ${j}: ${reason}${beautiful ? ', counted' : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), i: -1, j: -1, reason: '', count, message: `Beautiful splits: ${count}.` })
  return { input: { nums }, result: count, frames }
}

export const code = `count the ways to split nums into three non-empty parts that are beautiful
  set count to 0
  for each first cut i from 1 to n minus 2
    for each second cut j from i plus 1 to n minus 1
      let a be nums from 0 to i, b be nums from i to j, and c be nums from j to the end
      if a is a prefix of b or b is a prefix of c then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful_splits(nums):
    def is_prefix(short, long):
        if len(short) > len(long):
            return False
        return long[:len(short)] == short

    n = len(nums)
    count = 0
    for i in range(1, n - 1):
        for j in range(i + 1, n):
            a = nums[0:i]
            b = nums[i:j]
            c = nums[j:]
            if is_prefix(a, b) or is_prefix(b, c):
                count += 1
    return count
`
