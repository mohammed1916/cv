const codeLines = `function sumSortable(nums) {
  const n = nums.length
  // sorted = a sorted copy of nums
  const target = [...nums].sort((a, b) => a - b)
  let total = 0
  // for each k that divides n
  for (let k = 1; k <= n; k++) {
    if (n % k !== 0) continue
    let sortable = true
    // for each block of length k starting at b
    for (let b = 0; b < n && sortable; b += k) {
      const block = nums.slice(b, b + k)
      // target is the sorted slice of the same positions
      const want = target.slice(b, b + k)
      // if no rotation of the block equals target then sortable = false
      let matched = false
      for (let r = 0; r < k && !matched; r++) {
        matched = [...block.slice(r), ...block.slice(0, r)].every((v, i) => v === want[i])
      }
      if (!matched) sortable = false
    }
    // if sortable then total += k
    if (sortable) total += k
  }
  // return total
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def sum_sortable(nums):
    n = len(nums)
    target = sorted(nums)
    total = 0
    for k in range(1, n + 1):
        if n % k:
            continue
        ok = True
        for b in range(0, n, k):
            block = nums[b:b + k]
            want = target[b:b + k]
            if not any(block[r:] + block[:r] == want for r in range(k)):
                ok = False
                break
        if ok:
            total += k
    return total`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums)) throw new Error('Use an object with nums, a list of integers.')
  const nums = input.nums
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visual.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const target = [...nums].sort((a, b) => a - b)
  const frames = []
  let total = 0
  for (let k = 1; k <= n; k++) {
    if (n % k) continue
    let ok = true
    for (let b = 0; b < n && ok; b += k) {
      const block = nums.slice(b, b + k)
      const want = target.slice(b, b + k)
      let rotation = -1
      for (let r = 0; r < k; r++) {
        if ([...block.slice(r), ...block.slice(0, r)].every((v, i) => v === want[i])) { rotation = r; break }
      }
      frames.push({ phase: 'block', activeLine: L('no rotation of the block'), pythonLine: P('if not any'), k, start: b, block, want, rotation, sortable: rotation >= 0, total,
        message: rotation >= 0 ? `Block at ${b} rotates by ${rotation} to match.` : `Block at ${b} cannot match its sorted slice.` })
      if (rotation < 0) ok = false
    }
    if (ok) total += k
    frames.push({ phase: 'divisor', activeLine: L('if sortable then'), pythonLine: P('if ok:'), k, start: null, block: null, want: null, rotation: null, sortable: ok, total,
      message: ok ? `k = ${k} is sortable; total is now ${total}.` : `k = ${k} is not sortable.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), k: null, block: null, want: null, rotation: null, sortable: null, total,
    message: `Sum of sortable k values: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
