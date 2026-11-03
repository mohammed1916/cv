// Maximum total sum with threshold constraints.
// The step starts at 1 with total 0. Each pick takes an unused index whose threshold is at most the current
// step, adds its nums value, and advances the step. Picking stops only when no unused index is eligible.
// Eligibility only grows as the step rises, so at every step the largest eligible value is the right pick.

const CODE_TEXT = `FUNCTION maxTotalSum(nums, threshold)
    total ← 0
    available ← empty max-heap of indexes ordered by nums
    FOR step from 1 to n
        add every index i with threshold[i] = step to available
        IF available is empty THEN STOP
        i ← remove the index with the largest nums from available
        total ← total + nums[i]
    RETURN total`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `import heapq


def max_total_sum(nums, threshold):
    n = len(nums)
    total = 0
    available = []
    for step in range(1, n + 1):
        for i in range(n):
            if threshold[i] == step:
                heapq.heappush(available, (-nums[i], i))
        if not available:
            break
        neg, i = heapq.heappop(available)
        total += -neg
    return total


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(json.dumps(max_total_sum(data["nums"], data["threshold"])))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Step 1 with total zero; nothing is available yet.' },
  { id: 'unlock', label: 'Unlock', description: 'Indexes whose threshold equals this step become eligible.' },
  { id: 'pick', label: 'Pick', description: 'Take the largest eligible value and advance the step.' },
  { id: 'stop', label: 'Stop', description: 'No unused index is eligible; the run ends.' },
  { id: 'done', label: 'Total', description: 'Report the total of the picks.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and threshold.')
  const { nums, threshold } = input
  if (!Array.isArray(nums) || !Array.isArray(threshold) || nums.length < 1 || nums.length > 10) throw new Error('nums and threshold have 1 to 10 entries.')
  if (nums.length !== threshold.length) throw new Error('nums and threshold have the same length.')
  if (!nums.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('nums holds integers from -20 to 20.')
  if (!threshold.every(t => Number.isInteger(t) && t >= 1 && t <= nums.length)) throw new Error('Each threshold is an integer from 1 to the length.')
  return { nums, threshold }
}

export function buildTrace({ nums, threshold }) {
  const n = nums.length
  const frames = []
  let total = 0
  let available = []
  const picked = []
  const cmp = (a, b) => (nums[b] - nums[a]) || (a - b)
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, step: 0, total, available: [...available].sort(cmp),
    picked: [...picked], unlocked: [], chosen: -1, ...extra,
  })
  push('start', 'total ← 0', 'total = 0', 'Step 1, total 0. Nothing is available yet.', { step: 1 })
  let stopped = false
  for (let step = 1; step <= n && !stopped; step += 1) {
    const unlocked = []
    for (let i = 0; i < n; i += 1) if (threshold[i] === step) { unlocked.push(i); available.push(i) }
    push('unlock', 'add every index i with threshold[i] = step', 'if threshold[i] == step', unlocked.length
      ? `Step ${step}: indexes ${unlocked.join(', ')} become eligible.`
      : `Step ${step}: no index has this threshold; the eligible set is unchanged.`, { step, unlocked })
    if (available.length === 0) {
      stopped = true
      push('stop', 'IF available is empty THEN STOP', 'if not available', `Step ${step}: nothing is eligible, so the run stops.`, { step })
      break
    }
    available.sort(cmp)
    const chosen = available.shift()
    total += nums[chosen]
    picked.push(chosen)
    push('pick', 'i ← remove the index with the largest nums', 'neg, i = heapq.heappop', `Step ${step}: take index ${chosen} (value ${nums[chosen]}); total ${total}.`, { step, chosen })
  }
  push('done', 'RETURN total', 'return total', `Maximum total: ${total}.`, { step: picked.length + 1, total, chosen: -1 })
  return { input: { nums, threshold }, result: total, frames }
}
