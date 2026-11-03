// Minimum index sum of common elements.
// Reading used: a value's position is its first occurrence in each array. Values present in both
// arrays are compared by the sum of those two positions; every value reaching the smallest sum is returned,
// sorted ascending.

const CODE_TEXT = `FUNCTION minimumIndexSum(nums1, nums2)
    first ← map each value of nums2 to its first position
    best ← none; answer ← empty list; seen ← empty set
    FOR i, value in nums1
        IF value is in seen THEN CONTINUE
        add value to seen
        IF value is not in first THEN CONTINUE
        total ← i + first[value]
        IF best is none OR total < best THEN best ← total; answer ← [value]
        ELSE IF total = best THEN append value to answer
    SORT answer ascending
    RETURN answer`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def minimum_index_sum(nums1, nums2):
    first = {}
    for j, value in enumerate(nums2):
        first.setdefault(value, j)
    best = None
    answer = []
    seen = set()
    for i, value in enumerate(nums1):
        if value in seen:
            continue
        seen.add(value)
        if value not in first:
            continue
        total = i + first[value]
        if best is None or total < best:
            best = total
            answer = [value]
        elif total == best:
            answer.append(value)
    return sorted(answer)


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(json.dumps(minimum_index_sum(data["nums1"], data["nums2"])))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'index', label: 'Index', description: 'Record the first position of each value in nums2.' },
  { id: 'scan', label: 'Scan', description: 'Walk nums1 and check each new value against the index.' },
  { id: 'update', label: 'Compare', description: 'Compare the pair sum with the best sum so far.' },
  { id: 'done', label: 'Answer', description: 'Report every value that reached the best sum.' },
]

const INT = /^-?\d+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  for (const [name, list] of [['nums1', nums1], ['nums2', nums2]]) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 10) throw new Error(`${name} has 1 to 10 values.`)
    if (!list.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error(`${name} holds integers from 0 to 99.`)
  }
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const first = new Map()
  nums2.forEach((value, j) => { if (!first.has(value)) first.set(value, j) })
  const index = [...first.entries()]
  const frames = []
  const seen = []
  let best = null
  let answer = []
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message,
    best, answer: [...answer], seen: [...seen], index, i: -1, j: -1, total: null, status: 'index', ...extra,
  })

  push('index', 'map each value of nums2', 'first.setdefault', `Record the first position of ${first.size} distinct value${first.size === 1 ? '' : 's'} in nums2.`)
  for (let i = 0; i < nums1.length; i += 1) {
    const value = nums1[i]
    if (seen.includes(value)) {
      push('scan', 'IF value is in seen', 'if value in seen', `${value} was already handled; skip the repeat.`, { i, status: 'repeat' })
      continue
    }
    seen.push(value)
    push('scan', 'add value to seen', 'seen.add', `Take ${value} at position ${i} of nums1.`, { i, status: 'take' })
    if (!first.has(value)) {
      push('scan', 'IF value is not in first', 'if value not in first', `${value} never appears in nums2.`, { i, status: 'miss' })
      continue
    }
    const j = first.get(value)
    const total = i + j
    if (best === null || total < best) {
      best = total
      answer = [value]
      push('update', 'IF best is none', 'if best is None', `Sum ${i} + ${j} = ${total} is the new best; the answer restarts at ${value}.`, { i, j, total, status: 'new-best' })
    } else if (total === best) {
      answer.push(value)
      push('update', 'ELSE IF total = best', 'elif total == best', `Sum ${total} ties the best; ${value} joins the answer.`, { i, j, total, status: 'tie' })
    } else {
      push('update', 'ELSE IF total = best', 'elif total == best', `Sum ${total} is larger than the best ${best}; nothing changes.`, { i, j, total, status: 'worse' })
    }
  }
  answer.sort((a, b) => a - b)
  push('done', 'SORT answer ascending', 'return sorted', `Answer: ${answer.length ? answer.join(', ') : 'none'}.`, { status: 'done' })
  return { input: { nums1, nums2 }, result: answer, frames }
}
