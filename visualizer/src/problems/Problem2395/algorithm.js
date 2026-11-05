export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= -9 && x <= 9)) throw new Error('Each value is an integer from -9 to 9.')
  return { nums }
}

export function buildTrace({ nums }) {
  const seen = new Map()
  const frames = []
  let found = null
  for (let i = 0; i + 1 < nums.length; i++) {
    const sum = nums[i] + nums[i + 1]
    if (seen.has(sum)) {
      found = [seen.get(sum), i]
      frames.push({ phase: 'match', activeLine: CL('if (seen.has(sum))'), pythonLine: PL('if total in seen'), i, sums: [...seen.entries()], current: sum, found, result: true, message: `The pair at ${i} sums to ${sum}, the same as the pair at ${seen.get(sum)}. Two subarrays of length 2 match.` })
      break
    }
    seen.set(sum, i)
    frames.push({ phase: 'record', activeLine: CL('seen.set(sum, i)'), pythonLine: PL('seen[total] = i'), i, sums: [...seen.entries()], current: sum, found: null, result: null, message: `The pair at ${i} sums to ${sum}. Record it and continue.` })
  }
  const result = found !== null
  frames.push({ phase: 'done', activeLine: CL('return false'), pythonLine: PL('return False'), i: -1, sums: [...seen.entries()], current: null, found, result, message: result ? 'Equal sums exist.' : 'No two length-2 subarrays share a sum.' })
  return { input: { nums }, result, frames }
}

export const code = `function hasEqualPairSums(nums) {
  const seen = new Map();
  for (let i = 0; i + 1 < nums.length; i++) {
    const sum = nums[i] + nums[i + 1];
    if (seen.has(sum)) return true;
    seen.set(sum, i);
  }
  return false;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def has_equal_pair_sums(nums):
    seen = {}
    for i in range(len(nums) - 1):
        total = nums[i] + nums[i + 1]
        if total in seen:
            return True
        seen[total] = i
    return False
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
