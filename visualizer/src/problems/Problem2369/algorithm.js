export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 6)) {
    throw new Error('nums must be 2 to 10 integers, each from 1 to 6.')
  }
  return { nums }
}

export const code = `valid partition(nums)
  n = length of nums
  ok = array of n + 1 booleans, with ok[0] = true and the rest false
  for i from 1 to n
    if i ≥ 2 and ok[i - 2] and nums[i - 2] equals nums[i - 1] then ok[i] = true
    if i ≥ 3 and ok[i - 3] and the last three values are all equal, or each is one more than the one before, then ok[i] = true
  return ok[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// ok[i] says whether the first i values split into valid pieces; each piece has two or three values.
export function buildTrace({ nums }) {
  const n = nums.length
  const ok = [true, ...Array(n).fill(false)]
  const frames = [{ phase: 'start', position: 0, ok: [...ok], activeLine: L('ok = array of'), message: 'The empty prefix is a valid partition.' }]
  for (let i = 1; i <= n; i++) {
    const notes = []
    if (i >= 2 && ok[i - 2] && nums[i - 2] === nums[i - 1]) { ok[i] = true; notes.push('a pair of equal values') }
    if (i >= 3 && ok[i - 3]) {
      const [a, b, c] = [nums[i - 3], nums[i - 2], nums[i - 1]]
      if (a === b && b === c) { ok[i] = true; notes.push('three equal values') }
      else if (b === a + 1 && c === b + 1) { ok[i] = true; notes.push('three consecutive values') }
    }
    const verdict = ok[i] ? `valid, ending with ${notes.join(' or ')}` : 'not valid'
    frames.push({ phase: 'position', position: i, ok: [...ok], activeLine: L('for i from 1 to n'), message: `The first ${i} values are ${verdict}.` })
  }
  const result = ok[n]
  frames.push({ phase: 'done', position: n, ok: [...ok], activeLine: L('return ok[n]'), message: `The whole array ${result ? 'can' : 'cannot'} be partitioned.` })
  return { input: { nums }, result, frames }
}

export const python = `def valid_partition(nums):
    n = len(nums)
    ok = [True] + [False] * n
    for i in range(1, n + 1):
        if i >= 2 and ok[i - 2] and nums[i - 2] == nums[i - 1]:
            ok[i] = True
        if i >= 3 and ok[i - 3]:
            a, b, c = nums[i - 3], nums[i - 2], nums[i - 1]
            if (a == b == c) or (b == a + 1 and c == b + 1):
                ok[i] = True
    return ok[n]
`
