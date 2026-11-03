export const phases = [
  { id: 'start', label: 'Count values', description: 'Count how often each value occurs and check that the length splits evenly into groups of k.' },
  { id: 'group', label: 'Smallest value', description: 'The smallest value still left must begin a group, so every remaining copy of it starts a run here.' },
  { id: 'check', label: 'Check run', description: 'Each of the k consecutive values starting here must still have at least as many copies as the run needs.' },
  { id: 'consume', label: 'Consume run', description: 'Remove one run for every copy of the start value from each value in the run.' },
  { id: 'fail', label: 'Impossible', description: 'A required value is missing or too rare, so no partition exists.' },
  { id: 'done', label: 'Complete', description: 'Every value was consumed in complete runs, so the partition exists.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [1, 2, 3, 3, 4, 4], "k": 3}.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 24 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 50)) throw new Error('nums is a list of 1 to 24 integers from -50 to 50.')
  if (!Number.isInteger(k) || k < 1 || k > 8) throw new Error('k is an integer from 1 to 8.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  const sortedKeys = () => [...counts.keys()].sort((a, b) => a - b)
  const snap = (focus, offset, need) => ({ remaining: sortedKeys().map(v => [v, counts.get(v)]), focus, offset, need, k })
  const frames = []
  const frame = (phase, line, message, snapshot, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot, message })

  frame('start', 'counts = count each', `Count the ${nums.length} values. Groups have ${k} consecutive values, so the length must be a multiple of ${k}.`, snap(null, null, null), 'counts = Counter')
  if (nums.length % k !== 0) {
    frame('fail', 'len(nums) % k', `${nums.length} values cannot split into groups of ${k}.`, snap(null, null, null))
    frame('done', 'return true', 'The answer is false.', snap(null, null, null), 'return True')
    return { input: { nums, k }, result: false, frames }
  }

  let ok = true
  const original = sortedKeys()
  for (const value of original) {
    const need = counts.get(value)
    if (need === 0) {
      frame('group', 'if need == 0', `${value} was already used by an earlier run, so skip it.`, snap(value, null, 0))
      continue
    }
    frame('group', 'need = counts[value]', `${value} is the smallest value left, so ${need} run(s) must start here.`, snap(value, null, need))
    for (let offset = 0; offset < k; offset++) {
      const v = value + offset
      const have = counts.get(v) ?? 0
      frame('check', 'if counts[value + offset] < need', `Value ${v} has ${have} copies left; the runs need ${need}.`, snap(value, offset, need))
      if (have < need) {
        ok = false
        frame('fail', 'if counts[value + offset] < need', `Value ${v} is short by ${need - have}, so a run starting at ${value} cannot be completed.`, snap(value, offset, need))
        break
      }
      counts.set(v, have - need)
      frame('consume', 'counts[value + offset] -= need', `Use ${need} copies of ${v}; ${have - need} remain.`, snap(value, offset, need))
    }
    if (!ok) break
  }
  frame('done', 'return true', ok ? 'Every value was used in complete runs, so the answer is true.' : 'The answer is false.', snap(null, null, null), 'return True')
  return { input: { nums, k }, result: ok, frames }
}

export const code = `can divide (nums, k):
  if len(nums) % k != 0: return false
  counts = count each value in nums
  for value in sorted distinct values:
    need = counts[value]
    if need == 0: continue
    for offset in 0 .. k-1:
      if counts[value + offset] < need: return false
      counts[value + offset] -= need
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_divide(nums, k):
    if len(nums) % k != 0:
        return False
    counts = Counter(nums)
    for value in sorted(counts):
        need = counts[value]
        if need == 0:
            continue
        for offset in range(k):
            if counts[value + offset] < need:
                return False
            counts[value + offset] -= need
    return True`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
