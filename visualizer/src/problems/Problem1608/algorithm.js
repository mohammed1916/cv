export const phases = [
  { id: 'start', label: 'Start', description: 'Note the array length n. A valid count can never exceed n.' },
  { id: 'candidate', label: 'Candidate x', description: 'Pick the next candidate value x from 0 up to n.' },
  { id: 'count', label: 'Count', description: 'Count the entries that are at least x.' },
  { id: 'match', label: 'Match', description: 'The count equals x, so x is the answer.' },
  { id: 'miss', label: 'Miss', description: 'The count differs from x, so try the next candidate.' },
  { id: 'done', label: 'Complete', description: 'Return the matching x, or -1 when no candidate matches.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) {
    throw new Error('Enter a JSON array of 1 to 20 integers from 0 to 1000.')
  }
  return nums
}

export const code = [
  "function specialValue(nums) {",
  "  const n = nums.length;",
  "  for (let x = 0; x <= n; x++) {",
  "    const count = nums.filter(v => v >= x).length;",
  "    if (count === x) return x;",
  "  }",
  "  return -1;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def special_value(nums):
    n = len(nums)
    for x in range(n + 1):
        count = sum(1 for v in nums if v >= x)
        if count == x:
            return x
    return -1
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (phase, pseudo, py, message, snapshot) => ({ phase, activeLine: L(pseudo), pythonLine: P(py), message, snapshot })

export function buildTrace(nums) {
  const n = nums.length
  const snap = (x, count) => ({ nums, x, count })
  const frames = [at('start', 'const n = nums.length', 'n = len(nums)', `The array has ${n} entries, so the answer can only be between 0 and ${n}.`, snap(null, null))]
  for (let x = 0; x <= n; x++) {
    frames.push(at('candidate', 'for (let x = 0', 'for x in range', `Candidate x = ${x}. Count the entries that are at least ${x}.`, snap(x, null)))
    const count = nums.filter(v => v >= x).length
    frames.push(at('count', 'filter(v => v >= x)', 'count = sum(', `${count} entries are at least ${x}.`, snap(x, count)))
    if (count === x) {
      frames.push(at('match', 'if (count === x)', 'if count == x', `${count} equals x = ${x}, so the answer is ${x}.`, snap(x, count)))
      frames.push(at('done', 'return x;', 'return x', `Return ${x}, the first candidate whose count matches.`, snap(x, count)))
      return { input: nums, result: x, frames }
    }
    frames.push(at('miss', 'for (let x = 0', 'for x in range', `${count} is not ${x}, so this candidate fails.`, snap(x, count)))
  }
  frames.push(at('done', 'return -1', 'return -1', 'No candidate from 0 to n matches its own count, so the answer is -1.', snap(null, null)))
  return { input: nums, result: -1, frames }
}
