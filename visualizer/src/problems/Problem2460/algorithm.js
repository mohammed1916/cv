export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30) throw new Error('nums has 2 to 30 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 0 && x <= 1000)) throw new Error('Each num is an integer from 0 to 1000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const work = [...nums]
  const n = work.length
  frames.push({ pythonLine: PL('n = len(nums)'), phase: 'setup', activeLine: CL('n <-'), at: -1, state: [...work], message: 'Read the array in place from left to right.' })
  for (let i = 0; i < n - 1; i++) {
    frames.push({ pythonLine: PL('if nums[i] == nums[i + 1]'), phase: 'compare', activeLine: CL('IF nums[i]'), at: i, state: [...work], message: `Compare ${work[i]} and ${work[i + 1]}.` })
    if (work[i] === work[i + 1]) {
      work[i] *= 2
      frames.push({ pythonLine: PL('nums[i] *= 2'), phase: 'double', activeLine: CL('double nums[i]'), at: i, state: [...work], message: `Equal pair: double the left value to ${work[i]}.` })
      work[i + 1] = 0
      frames.push({ pythonLine: PL('nums[i + 1] = 0'), phase: 'zero', activeLine: CL('double nums[i]'), at: i + 1, state: [...work], message: 'Set the right value to zero.' })
    }
  }
  const nonzero = work.filter(x => x !== 0)
  const result = [...nonzero, ...Array(n - nonzero.length).fill(0)]
  frames.push({ pythonLine: PL('nonzero = [x'), phase: 'shift', activeLine: CL('collect the nonzero'), at: -1, state: [...work], message: `Keep the ${nonzero.length} nonzero values in order.` })
  frames.push({ pythonLine: PL('return nonzero'), phase: 'done', activeLine: CL('RETURN the result'), at: -1, state: result, message: 'Pad the end with zeros and return.' })
  return { input: { nums }, result, frames }
}

export const code = `FUNCTION applyOperations(nums)
  n <- length of nums
  FOR i from 0 to n minus 2
    IF nums[i] equals nums[i+1] THEN
      double nums[i] and set nums[i+1] to 0
  collect the nonzero values in order
  pad with zeros at the end
  RETURN the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def apply_operations(nums):
    n = len(nums)
    for i in range(n - 1):
        if nums[i] == nums[i + 1]:
            nums[i] *= 2
            nums[i + 1] = 0
    nonzero = [x for x in nums if x != 0]
    return nonzero + [0] * (n - len(nonzero))
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
