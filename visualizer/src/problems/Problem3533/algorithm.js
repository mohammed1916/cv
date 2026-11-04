const MAX_NUMS = 6

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NUMS) throw new Error(`nums has 1 to ${MAX_NUMS} entries here.`)
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 1 || value > 100000) throw new Error('Each number is an integer from 1 to 100000.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 100) throw new Error('k is an integer from 1 to 100.')
  return { nums, k }
}

export const code = `smallest order of nums whose concatenation divides by k
  sort nums so the smallest choice is always tried first
  work out what appending each number multiplies the remainder by
  search(used numbers, remainder so far)
    if every number is used, succeed only when the remainder is 0
    if this used set and remainder is known to fail, give up at once
    for each unused number, smallest first
      new remainder = (remainder x 10^digits + number) mod k
      if search succeeds from there, this number is part of the answer
    nothing worked: record this used set and remainder as failing
  the numbers chosen on the successful path are the answer, else empty`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def concatenated_divisibility(nums, k):
    nums = sorted(nums)
    n = len(nums)
    shift = [10 ** len(str(x)) % k for x in nums]
    full = (1 << n) - 1
    dead = set()
    order = []

    def search(mask, r):
        if mask == full:
            return r == 0
        if (mask, r) in dead:
            return False
        for i in range(n):
            if mask >> i & 1:
                continue
            next_r = (r * shift[i] + nums[i]) % k
            if search(mask | 1 << i, next_r):
                order.append(nums[i])
                return True
        dead.add((mask, r))
        return False

    return order[::-1] if search(0, 0) else []
`
const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'setup', label: 'Sort', description: 'Sort numerically and prepare the multipliers.' },
  { id: 'enter', label: 'Visit', description: 'Arrive at a used set and remainder.' },
  { id: 'try', label: 'Append', description: 'Append the next unused number and update the remainder.' },
  { id: 'leaf', label: 'All used', description: 'Check the finished number against k.' },
  { id: 'memo', label: 'Known dead', description: 'This state already failed, so skip it.' },
  { id: 'dead', label: 'Backtrack', description: 'Every choice failed; record the state.' },
  { id: 'pick', label: 'Keep', description: 'A choice led to success, so it stays in the answer.' },
  { id: 'done', label: 'Result', description: 'Report the order, or an empty list.' },
]

export const inputLabel = 'Object with nums and k'
export const complexity = 'O(2^n · k · n) time and O(2^n · k) space, since each used set and remainder is expanded at most once. The input box takes up to 6 numbers so the search tree stays readable; the Python handles the full limit of 13.'
export const examples = [
  { label: 'Needs backtracking', input: '{"nums":[34,7,20],"k":4}' },
  { label: 'Dead states repay', input: '{"nums":[1,4,7,2],"k":3}' },
  { label: 'Number order, not text', input: '{"nums":[100,9,25],"k":25}' },
  { label: 'One number, no answer', input: '{"nums":[13],"k":7}' },
]

export function buildTrace({ nums: given, k }) {
  const nums = [...given].sort((a, b) => a - b)
  const n = nums.length
  const digits = nums.map(value => String(value).length)
  const shift = digits.map(count => 10 ** count % k)
  const full = (1 << n) - 1
  const dead = new Set()
  const deadLog = []
  const nodes = []
  const order = []
  const frames = []
  const path = []
  const push = (phase, key, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(key), pythonLine: P(pyKey), message,
    at: frames.length, nodeId: null, mask: 0, r: 0, path: [...path], candidate: null, calc: null, kept: [...order], ...extra,
  })

  push('setup', 'sort nums', 'nums = sorted', `Sorted by value: ${nums.join(', ')}. Trying the smallest first means the first success is the smallest order.`)
  push('setup', 'work out what', 'shift =', `Appending a number with d digits multiplies what came before by 10^d. Only the remainder mod ${k} has to be carried.`)

  const search = (mask, r, parent, via) => {
    const node = { id: nodes.length, parent, mask, r, via, depth: path.length, enter: frames.length, exit: null, outcome: null }
    nodes.push(node)
    const here = { nodeId: node.id, mask, r }
    const finish = (outcome, value) => { node.outcome = outcome; node.exit = frames.length - 1; return value }
    if (mask === full) {
      const ok = r === 0
      push('leaf', 'every number is used', 'return r == 0', ok ? `All numbers placed and the remainder is 0, so ${path.map(i => nums[i]).join('')} divides by ${k}.` : `All numbers placed, but ${path.map(i => nums[i]).join('')} leaves remainder ${r}. Fail.`, here)
      return finish(ok ? 'found' : 'miss', ok)
    }
    if (dead.has(`${mask},${r}`)) {
      push('memo', 'known to fail', 'in dead', `Same numbers used and same remainder ${r} as a state that already failed. What was appended earlier cannot matter now, so skip it.`, here)
      return finish('seen', false)
    }
    const used = path.length ? `After ${path.map(i => nums[i]).join(', ')}` : 'Nothing placed yet'
    push('enter', 'search(used', 'if mask == full', `${used}: the remainder is ${r}.`, here)
    for (let i = 0; i < n; i++) {
      if (mask >> i & 1) continue
      const next = (r * shift[i] + nums[i]) % k
      const calc = { r, power: 10 ** digits[i], value: nums[i], k, next }
      push('try', 'new remainder', 'next_r =', `Append ${nums[i]}: (${r} × ${calc.power} + ${nums[i]}) mod ${k} = ${next}.`, { ...here, candidate: i, calc })
      path.push(i)
      const ok = search(mask | 1 << i, next, node.id, i)
      path.pop()
      if (ok) {
        order.push(nums[i])
        push('pick', 'if search succeeds', 'order.append', `${nums[i]} led to a full answer, and nothing smaller did at this position. Keep it.`, { ...here, candidate: i })
        return finish('found', true)
      }
    }
    dead.add(`${mask},${r}`)
    deadLog.push({ mask, r, at: frames.length })
    push('dead', 'nothing worked', 'dead.add', `Every unused number failed from remainder ${r}. Record this state so no other order repeats the work.`, here)
    return finish('dead', false)
  }

  const found = search(0, 0, null, null)
  const result = found ? [...order].reverse() : []
  push('done', 'successful path', 'return order', found
    ? `The answer is [${result.join(', ')}], which writes out as ${result.join('')}.`
    : `No order of ${nums.join(', ')} divides by ${k}, so the answer is the empty list.`, { done: true })
  return { input: { nums, k }, result, frames, nodes, deadLog, digits }
}
