export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 40) throw new Error('nums has 1 to 40 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 100)) throw new Error('Each value is an integer from 0 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  const seen = new Set()
  let mi = Infinity
  let mx = -Infinity
  let result = null
  frames.push({ pythonLine: PL('seen = set()'), phase: 'setup', activeLine: CL('const seen'), at: -1, seen: [], mi: null, mx: null, duplicate: false, result: null, message: `There are ${n} values. Start with nothing seen.` })
  for (let i = 0; i < n; i++) {
    const x = nums[i]
    frames.push({ pythonLine: PL('for x in nums'), phase: 'scan', activeLine: CL('for (const x'), at: i, seen: [...seen], mi: finite(mi), mx: finite(mx), duplicate: false, result: null, message: `Read ${x} at index ${i}.` })
    if (seen.has(x)) {
      result = false
      frames.push({ pythonLine: PL('return False'), phase: 'duplicate', activeLine: CL('return false'), at: i, seen: [...seen], mi: finite(mi), mx: finite(mx), duplicate: true, result, message: `${x} was already seen, so a value is repeated and the answer is false.` })
      break
    }
    seen.add(x)
    mi = Math.min(mi, x)
    mx = Math.max(mx, x)
    frames.push({ pythonLine: PL('seen.add(x)'), phase: 'add', activeLine: CL('seen.add(x)'), at: i, seen: [...seen], mi, mx, duplicate: false, result: null, message: `${x} is new. The smallest so far is ${mi} and the largest is ${mx}.` })
  }
  if (result === null) {
    const span = mx - mi + 1
    result = span === n
    frames.push({ pythonLine: PL('return mx - mi + 1 == len(nums)'), phase: 'span', activeLine: CL('return mx - mi + 1'), at: -1, seen: [...seen], mi, mx, duplicate: false, result, message: `The span from ${mi} to ${mx} holds ${span} integers, and there are ${n} values: ${result ? 'they match, so the array is consecutive.' : 'they differ, so a value is missing.'}` })
  }
  return { input: { nums }, result, frames }
}

function finite(v) { return Number.isFinite(v) ? v : null }

export const code = `function isConsecutive(nums) {
  const seen = new Set();
  let mi = Infinity;
  let mx = -Infinity;
  for (const x of nums) {
    if (seen.has(x)) return false;
    seen.add(x);
    mi = Math.min(mi, x);
    mx = Math.max(mx, x);
  }
  return mx - mi + 1 === nums.length;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def is_consecutive(nums):
    seen = set()
    mi = float("inf")
    mx = float("-inf")
    for x in nums:
        if x in seen:
            return False
        seen.add(x)
        mi = min(mi, x)
        mx = max(mx, x)
    return mx - mi + 1 == len(nums)
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
