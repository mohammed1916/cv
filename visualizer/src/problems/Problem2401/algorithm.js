export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 14) throw new Error('nums has 1 to 14 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 31)) throw new Error('Each value is an integer from 1 to 31.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let l = 0
  let used = 0
  let best = 0
  for (let r = 0; r < nums.length; r++) {
    while ((used & nums[r]) !== 0) {
      frames.push({ phase: 'shrink', activeLine: CL('while ((used & nums[r])'), pythonLine: PL('while used & nums[r]'), l, r, used, best, message: `${nums[r]} shares a bit with the window, so drop ${nums[l]} from the left.` })
      used ^= nums[l]
      l++
    }
    used |= nums[r]
    best = Math.max(best, r - l + 1)
    frames.push({ phase: 'grow', activeLine: CL('used |= nums[r]'), pythonLine: PL('used |= nums[r]'), l, r, used, best, message: `Add ${nums[r]}: the window ${l}..${r} is nice, length ${r - l + 1}. Longest so far ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return best'), pythonLine: PL('return best'), l: -1, r: -1, used, best, message: `The longest nice subarray has length ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function longestNiceSubarray(nums) {
  let l = 0;
  let used = 0;
  let best = 0;
  for (let r = 0; r < nums.length; r++) {
    while ((used & nums[r]) !== 0) {
      used ^= nums[l];
      l++;
    }
    used |= nums[r];
    best = Math.max(best, r - l + 1);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def longest_nice_subarray(nums):
    l = 0
    used = 0
    best = 0
    for r in range(len(nums)):
        while used & nums[r]:
            used ^= nums[l]
            l += 1
        used |= nums[r]
        best = max(best, r - l + 1)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
