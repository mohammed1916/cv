// Minimum operations to make the array beautiful.
// Each operation adds one to an element other than index zero. The final array b must satisfy
// b[0] = a[0], b[i] >= a[i], and b[i] divisible by b[i - 1]. Cost is the sum of b[i] - a[i].
// A greedy smallest-multiple choice is not optimal, so the search keeps, for every candidate value of the
// current element, the cheapest chain ending there. Candidate values run up to twice the largest input,
// which the test sweep checks against a much wider search on small inputs.

const CODE_TEXT = `FUNCTION minOperations(nums)
    reach ← { nums[0]: cost 0 }
    limit ← 2 × max(nums)
    FOR i from 1 to n - 1
        next ← empty map
        FOR v from nums[i] to limit
            cheapest ← smallest cost in reach whose value divides v
            IF cheapest exists THEN next[v] ← cheapest + (v - nums[i])
        reach ← next
    RETURN smallest cost in reach`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def min_operations(nums):
    reach = {nums[0]: 0}
    limit = 2 * max(nums)
    for i in range(1, len(nums)):
        nxt = {}
        for v in range(nums[i], limit + 1):
            options = [cost for u, cost in reach.items() if v % u == 0]
            if options:
                nxt[v] = min(options) + v - nums[i]
        reach = nxt
    return min(reach.values())


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(min_operations(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Anchor', description: 'The first element is fixed; it costs nothing.' },
  { id: 'layer', label: 'Layer', description: 'For this element, try each value and keep the cheapest chain.' },
  { id: 'done', label: 'Answer', description: 'Pick the cheapest final value and read the chain back.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use a list of 1 to 8 positive integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const limit = 2 * Math.max(...nums)
  let reach = new Map([[nums[0], { cost: 0, from: null }]])
  const layers = [reach]
  const preview = map => [...map.entries()].sort((a, b) => a[0] - b[0]).slice(0, 8).map(([value, info]) => ({ value, cost: info.cost }))
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, layer: 0, element: 0, limit,
    candidates: preview(reach), chosen: null, total: null, ...extra,
  })
  push('start', 'reach ← { nums[0]: cost 0 }', 'reach = {nums[0]: 0}', `Element 0 is fixed at ${nums[0]} with cost 0. Candidate values go up to ${limit}.`)
  for (let i = 1; i < nums.length; i += 1) {
    const next = new Map()
    for (let v = nums[i]; v <= limit; v += 1) {
      let best = null
      for (const [u, info] of reach) {
        if (v % u !== 0) continue
        if (best === null || info.cost < best.cost || (info.cost === best.cost && u < best.u)) best = { u, cost: info.cost }
      }
      if (best) next.set(v, { cost: best.cost + v - nums[i], from: best.u })
    }
    reach = next
    layers.push(reach)
    push('layer', 'FOR v from nums[i] to limit', 'for v in range(nums[i], limit + 1)', `Element ${i} (original ${nums[i]}): ${reach.size} value${reach.size === 1 ? '' : 's'} reachable.`, { layer: i, element: nums[i] })
  }
  let endValue = null
  for (const [v, info] of reach) {
    if (endValue === null || info.cost < reach.get(endValue).cost || (info.cost === reach.get(endValue).cost && v < endValue)) endValue = v
  }
  const chosen = new Array(nums.length)
  chosen[nums.length - 1] = endValue
  for (let i = nums.length - 1; i >= 1; i -= 1) chosen[i - 1] = layers[i].get(chosen[i]).from
  const total = reach.get(endValue).cost
  push('done', 'RETURN smallest cost in reach', 'return min(reach.values())', `Cheapest final array ${chosen.join(', ')} costs ${total}.`, { layer: nums.length - 1, chosen, total, candidates: preview(reach) })
  return { input: nums, result: total, frames }
}
