const CODE = [
  'FUNCTION countKBig(nums, k)',
  '    n ← length of nums ; count ← 0',
  '    FOR each index i from 0 to n - 1',
  '        before ← number of j < i with nums[j] < nums[i]',
  '        after ← number of j > i with nums[j] < nums[i]',
  '        IF before ≥ k AND after ≥ k THEN count ← count + 1',
  '    RETURN count',
]

const PY = [
  'def count_k_big(nums, k):',
  '    n = len(nums)',
  '    count = 0',
  '    for i in range(n):',
  '        before = sum(1 for j in range(i) if nums[j] < nums[i])',
  '        after = sum(1 for j in range(i + 1, n) if nums[j] < nums[i])',
  '        if before >= k and after >= k:',
  '            count += 1',
  '    return count',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Start with no k-big index counted.' },
  { id: 'count', label: 'Count', description: 'Count smaller values before and after this index.' },
  { id: 'decide', label: 'Decide', description: 'Test both counts against k.' },
  { id: 'done', label: 'Result', description: 'Report the number of k-big indices.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20 in this visualization.')
  if (!Number.isInteger(k) || k < 0 || k > 12) throw new Error('k is an integer from 0 to 12 in this visualization.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  let count = 0
  const frames = []
  frames.push({ pythonLine: pyLine('count = 0'), phase: 'start', activeLine: codeLine('n ← length of nums ; count ← 0'), i: null, before: [], after: [], count, k, message: `Look for indices with at least ${k} strictly smaller values on each side.` })
  const befores = [], afters = []
  for (let i = 0; i < n; i++) {
    let before = 0, after = 0
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) before++
    for (let j = i + 1; j < n; j++) if (nums[j] < nums[i]) after++
    befores.push(before)
    afters.push(after)
    frames.push({ pythonLine: pyLine('after = sum(1 for j in range(i + 1, n) if nums[j] < nums[i])'), phase: 'count', activeLine: codeLine('after ← number of j > i with nums[j] < nums[i]'), i, before: [...befores], after: [...afters], count, k, message: `Index ${i} (value ${nums[i]}): ${before} smaller before, ${after} smaller after.` })
    const big = before >= k && after >= k
    if (big) count += 1
    frames.push({ pythonLine: pyLine('if before >= k and after >= k:'), phase: 'decide', activeLine: codeLine('IF before ≥ k AND after ≥ k THEN count ← count + 1'), i, before: [...befores], after: [...afters], count, k, big, message: big ? `Index ${i} is ${k}-big. Count ${count}.` : `Index ${i} is not ${k}-big.` })
  }
  frames.push({ pythonLine: pyLine('return count'), phase: 'done', activeLine: codeLine('RETURN count'), i: null, before: [...befores], after: [...afters], count, k, message: `${count} k-big ind${count === 1 ? 'ex' : 'ices'}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
