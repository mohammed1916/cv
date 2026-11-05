// LeetCode 4040: Minimum Operations to Form Subset Sum I.
// An operation doubles one value or halves it (floor). For each element all doublings come before
// any halving, so one element with a doublings and b halvings ends at floor(v * 2^a / 2^b) for cost a + b.
// Choose for each element either "leave it out" (cost 0) or one reachable final value with its cost,
// so that the chosen values sum to the target. Dynamic programming over sums gives the minimum cost.
// The note's bounds (length 1..100, values 1..500, target 1..5000) are checked on parse; the
// visualization caps the array at 6 values and the target at 24, since each row of sums is shown.

const MAX_VISUAL_VALUES = 6
const MAX_VISUAL_TARGET = 24
const MAX_DOUBLINGS = 13
const MAX_HALVINGS = 13

const PYTHON_SOURCE = `def min_operations_subset_sum(nums, target):
    INF = float('inf')
    best = [INF] * (target + 1)
    best[0] = 0
    for v in nums:
        options = {}
        for a in range(14):
            for b in range(14):
                w = (v << a) >> b
                if 1 <= w <= target and a + b < options.get(w, INF):
                    options[w] = a + b
        next_best = best[:]
        for s in range(target + 1):
            if best[s] == INF:
                continue
            for w, cost in options.items():
                if s + w <= target and best[s] + cost < next_best[s + w]:
                    next_best[s + w] = best[s] + cost
        best = next_best
    return best[target] if best[target] != INF else -1

if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(min_operations_subset_sum(data["nums"], data["sum"]))
`

export const code = `function minOperations(nums, sum) {
  let best = Array(sum + 1).fill(Infinity)
  best[0] = 0
  for (const v of nums) {
    const options = reachableOptions(v, sum)
    const next = best.slice()
    for (let s = 0; s <= sum; s++) {
      if (best[s] === Infinity) continue
      for (const [w, cost] of options) {
        if (s + w <= sum && best[s] + cost < next[s + w]) next[s + w] = best[s] + cost
      }
    }
    best = next
  }
  return best[sum] === Infinity ? -1 : best[sum]
}

function reachableOptions(v, sum) {
  const options = new Map()
  for (let a = 0; a <= 13; a++) {
    for (let b = 0; b <= 13; b++) {
      const w = Math.floor((v * 2 ** a) / 2 ** b)
      if (w >= 1 && w <= sum && (!options.has(w) || a + b < options.get(w))) options.set(w, a + b)
    }
  }
  return options
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and sum.')
  const { nums, sum } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('nums has 1 to 100 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 500)) throw new Error('Each value is an integer from 1 to 500.')
  if (!Number.isInteger(sum) || sum < 1 || sum > 5000) throw new Error('sum is an integer from 1 to 5000.')
  return { nums, sum }
}

// Cheapest cost for each final value w in 1..target: a doublings first, then b halvings.
export function reachableOptions(v, target) {
  const options = new Map()
  for (let a = 0; a <= MAX_DOUBLINGS; a += 1) {
    for (let b = 0; b <= MAX_HALVINGS; b += 1) {
      const w = Math.floor((v * 2 ** a) / 2 ** b)
      if (w >= 1 && w <= target && (!options.has(w) || a + b < options.get(w))) options.set(w, a + b)
    }
  }
  return options
}

export function buildTrace({ nums, sum }) {
  if (nums.length > MAX_VISUAL_VALUES || sum > MAX_VISUAL_TARGET) {
    throw new Error(`The visualization caps the array at ${MAX_VISUAL_VALUES} values and the sum at ${MAX_VISUAL_TARGET}.`)
  }
  const INF = Infinity
  const toView = arr => arr.map(x => (x === INF ? null : x))
  let best = Array(sum + 1).fill(INF)
  best[0] = 0
  const frames = []
  frames.push({ phase: 'setup', pythonLine: P('best = [INF]'), activeLine: L('let best = Array(sum + 1)'), index: -1, v: null, options: [], best: toView(best), changed: [],
    message: `Target ${sum}. Sum 0 costs nothing; every other sum is unreachable so far.` })

  nums.forEach((v, index) => {
    const options = reachableOptions(v, sum)
    const optionList = [...options.entries()].map(([w, cost]) => ({ w, cost })).sort((p, q) => p.w - q.w)
    frames.push({ phase: 'options', pythonLine: P('options = {}'), activeLine: L('const options = reachableOptions'), index, v, options: optionList, best: toView(best), changed: [],
      message: `Value ${v} can become ${optionList.map(o => `${o.w} (cost ${o.cost})`).join(', ')} within the target.` })
    const next = best.slice()
    const changed = []
    for (let s = 0; s <= sum; s += 1) {
      if (best[s] === INF) continue
      for (const { w, cost } of optionList) {
        if (s + w <= sum && best[s] + cost < next[s + w]) {
          next[s + w] = best[s] + cost
          changed.push(s + w)
        }
      }
    }
    best = next
    frames.push({ phase: 'combine', pythonLine: P('next_best = best[:]'), activeLine: L('for (let s = 0; s <= sum'), index, v, options: optionList,
      best: toView(best), changed: [...new Set(changed)].sort((p, q) => p - q),
      message: changed.length ? `Using ${v} raises ${new Set(changed).size} sum${new Set(changed).size === 1 ? '' : 's'}; the cheapest costs are updated.` : `${v} cannot improve any sum; it stays out.` })
  })
  const answer = best[sum] === INF ? -1 : best[sum]
  frames.push({ phase: 'done', pythonLine: P('return best[target]'), activeLine: L('return best[sum] === Infinity'), index: -1, v: null, options: [], best: toView(best), changed: [],
    message: answer < 0 ? `Sum ${sum} cannot be formed, so the answer is -1.` : `The minimum number of operations for sum ${sum} is ${answer}.` })
  return { input: { nums, sum }, nums, sum, answer, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Start table', description: 'Only sum 0 is reachable at cost 0.' },
  { id: 'options', label: 'Reachable values', description: 'Each element can become several values at a cost.' },
  { id: 'combine', label: 'Combine', description: 'Add the element to every reachable sum, keeping the cheapest.' },
  { id: 'done', label: 'Answer', description: 'Read the cost of the target sum.' },
]
