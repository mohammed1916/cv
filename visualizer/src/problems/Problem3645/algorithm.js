// Teaching model (knowledge-derived): an element is killed for good once the active count
// reaches its limit, so the state is (activated set, largest active count seen so far).
const lineOf = (lines, text) => lines.findIndex(line => line.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with value and limit.')
  const { value, limit } = input
  if (!Array.isArray(value) || !Array.isArray(limit) || value.length !== limit.length) throw new Error('value and limit need the same length.')
  if (value.length < 1 || value.length > 8) throw new Error('Use 1 to 8 elements for the visualization.')
  if (!value.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (!limit.every(v => Number.isInteger(v) && v >= 1 && v <= 10)) throw new Error('Each limit is an integer from 1 to 10.')
  return { value, limit }
}

// Returns the best total from a state, along with the chosen next element.
function solve(value, limit) {
  const n = value.length
  const memo = new Map()
  function best(activated, maxX) {
    const key = `${activated},${maxX}`
    if (memo.has(key)) return memo.get(key)
    let bestTotal = 0
    let choice = -1
    const active = []
    for (let j = 0; j < n; j++) if (activated & (1 << j) && limit[j] > maxX) active.push(j)
    for (let i = 0; i < n; i++) {
      if (activated & (1 << i) || limit[i] <= maxX || active.length >= limit[i]) continue
      const count = active.length + 1
      const total = value[i] + best(activated | (1 << i), Math.max(maxX, count)).total
      if (total > bestTotal) { bestTotal = total; choice = i }
    }
    const result = { total: bestTotal, choice }
    memo.set(key, result)
    return result
  }
  return best
}

export function buildTrace({ value, limit }) {
  const n = value.length
  const best = solve(value, limit)
  const frames = []
  let activated = 0
  let maxX = 0
  let total = 0
  frames.push({ pythonLine: lineOf(PY_LINES, 'memo = {}'), phase: 'start', activeLine: L('start with nothing activated'), activeSet: [], dead: [], index: -1, total: 0, message: 'Nothing is activated yet.' })
  for (;;) {
    const step = best(activated, maxX)
    if (step.choice < 0) break
    const i = step.choice
    const active = []
    for (let j = 0; j < n; j++) if (activated & (1 << j) && limit[j] > maxX) active.push(j)
    const count = active.length + 1
    total += value[i]
    activated |= 1 << i
    const newMax = Math.max(maxX, count)
    const killed = [...active, i].filter(j => limit[j] <= newMax)
    maxX = newMax
    const remaining = [...active, i].filter(j => limit[j] > newMax)
    frames.push({ pythonLine: lineOf(PY_LINES, 'result = max'), phase: 'activate', activeLine: L('activate it, count'), index: i, activeSet: remaining, dead: killed, total,
      message: `Activate ${i} (value ${value[i]}, limit ${limit[i]}). Active count becomes ${count}; ${killed.length ? `indices ${killed.join(', ')} become inactive for good` : 'nothing is killed'}.` })
    if (activated === (1 << n) - 1) break
  }
  frames.push({ pythonLine: lineOf(PY_LINES, 'return best'), phase: 'done', activeLine: L('return the best total'), activeSet: [], dead: [], index: -1, total: best(0, 0).total,
    message: `Best total is ${best(0, 0).total}.` })
  return { input: { value, limit }, result: best(0, 0).total, frames }
}

export const code = `maximum total from an activation order
  start with nothing activated and no count reached
  while an element can still be activated
    choose the element with the best continuation
    activate it, count the active elements
    kill every element whose limit is at most that count
  return the best total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_total(value, limit):
    memo = {}

    def best(activated, max_x):
        key = (activated, max_x)
        if key in memo:
            return memo[key]
        active = [j for j in range(len(value)) if activated >> j & 1 and limit[j] > max_x]
        result = 0
        for i in range(len(value)):
            if activated >> i & 1 or limit[i] <= max_x or len(active) >= limit[i]:
                continue
            count = len(active) + 1
            result = max(result, value[i] + best(activated | 1 << i, max(max_x, count)))
        memo[key] = result
        return result

    return best(0, 0)`
const PY_LINES = python.split('\n')
