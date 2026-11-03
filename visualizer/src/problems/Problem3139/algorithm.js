const MOD = 1000000007n
const MAX_LENGTH = 12
const MAX_VALUE = 60
const MAX_COST = 60

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, cost1 and cost2.')
  const { nums, cost1, cost2 } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} entries.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is a whole number from 1 to ${MAX_VALUE}.`)
  for (const [name, c] of [['cost1', cost1], ['cost2', cost2]]) {
    if (!Number.isInteger(c) || c < 1 || c > MAX_COST) throw new Error(`${name} is a whole number from 1 to ${MAX_COST}.`)
  }
  return { nums: [...nums], cost1, cost2 }
}

// Cheapest way to raise every value to target, using single steps and paired steps on distinct indices.
function costFor(nums, target, cost1, cost2) {
  const deficits = nums.map(v => target - v)
  const total = deficits.reduce((a, b) => a + b, 0)
  const biggest = Math.max(...deficits)
  // At most total - biggest pairs fit (the biggest index cannot pair with itself), and at most floor(total / 2).
  const pairs = Math.min(Math.floor(total / 2), total - biggest)
  const singlesOnly = BigInt(total) * BigInt(cost1)
  const paired = BigInt(pairs) * BigInt(cost2) + BigInt(total - 2 * pairs) * BigInt(cost1)
  return { deficits, total, biggest, pairs, cost: singlesOnly < paired ? singlesOnly : paired, singlesOnly, paired }
}

// First target where the largest deficit no longer exceeds the sum of the others.
function balanceTarget(nums, top) {
  const n = nums.length
  const sum = nums.reduce((a, b) => a + b, 0)
  const low = Math.min(...nums)
  for (let target = top; target <= 3 * top + 3; target++) {
    const biggest = target - low
    const total = n * target - sum
    if (2 * biggest <= total) return target
  }
  return null
}

export function buildTrace({ nums, cost1, cost2 }) {
  const top = Math.max(...nums)
  const balance = balanceTarget(nums, top)
  const candidates = new Set([top, top + 1, top + 2])
  if (balance !== null) for (const t of [balance - 1, balance, balance + 1, balance + 2]) candidates.add(t)
  const targets = [...candidates].filter(t => t >= top).sort((a, b) => a - b)

  const frames = []
  let best = null
  let bestTarget = null
  const snapshot = extra => ({ nums: [...nums], best, bestTarget, ...extra })
  const blank = { target: null, deficits: null, total: null, biggest: null, pairs: null, singlesOnly: null, paired: null }

  frames.push({
    phase: 'start', activeLine: L('set top to the largest value'), pythonLine: P('top = max(nums)'),
    message: `The largest value is ${top}. Check the targets ${targets.join(', ')}.`,
    ...blank, ...snapshot({}),
  })
  frames.push({
    phase: 'balance', activeLine: L('set balance to the first target'), pythonLine: P('balance = None'),
    message: balance === null
      ? 'No balance point exists within range, so only the targets near the top are checked.'
      : `Balance point ${balance}: from here the largest deficit fits within the others, so pairs can be used fully.`,
    ...blank, ...snapshot({}),
  })

  for (const target of targets) {
    const info = costFor(nums, target, cost1, cost2)
    frames.push({
      phase: 'target', activeLine: L('for each candidate target'), pythonLine: P('for target in sorted(c for c in candidates if c >= top):'),
      message: `Target ${target}: deficits [${info.deficits.join(', ')}], total ${info.total}.`,
      ...blank, target, deficits: info.deficits, total: info.total, biggest: info.biggest, ...snapshot({}),
    })
    frames.push({
      phase: 'compare', activeLine: L('set pairs to the smaller'), pythonLine: P('pairs = min(total // 2, total - biggest)'),
      message: `Up to ${info.pairs} paired steps fit. Singles only cost ${info.singlesOnly}; with pairs ${info.paired}.`,
      ...blank, target, deficits: info.deficits, total: info.total, biggest: info.biggest, pairs: info.pairs,
      singlesOnly: info.singlesOnly, paired: info.paired, ...snapshot({}),
    })
    if (best === null || info.cost < best) {
      best = info.cost
      bestTarget = target
      frames.push({
        phase: 'best', activeLine: L('if best is nothing or cost is less than best'), pythonLine: P('if best is None or cost < best:'),
        message: `Target ${target} is the new best at cost ${info.cost}.`,
        ...blank, target, deficits: info.deficits, total: info.total, biggest: info.biggest, pairs: info.pairs,
        singlesOnly: info.singlesOnly, paired: info.paired, ...snapshot({ best, bestTarget }),
      })
    }
  }

  const result = best % MOD
  frames.push({
    phase: 'done', activeLine: L('return best modulo'), pythonLine: P('return best % 1000000007'),
    message: `Minimum cost ${best}, reported modulo 1000000007 as ${result}.`,
    ...blank, target: bestTarget, ...snapshot({ best, bestTarget }),
  })
  return { input: { nums: [...nums], cost1, cost2 }, result: Number(result), exactCost: best.toString(), frames }
}

function lineIndex(lines, text, label) {
  const index = lines.findIndex(line => line.trim() === text || line.includes(text))
  if (index < 0) throw new Error(`Missing ${label} line: ${text}`)
  return index + 1
}
const L = text => lineIndex(code.map(c => c.text), text, 'pseudocode')
const P = text => lineIndex(python.split('\n'), text, 'python')

export const code = `minimum cost to equalize the array
set top to the largest value in nums
set balance to the first target where the largest deficit fits within the others
set candidates to top, top plus one, top plus two and the targets around balance
set best to nothing
for each candidate target at or above top
  set deficits to target minus each value
  set total to the sum of deficits and biggest to the largest deficit
  set pairs to the smaller of total divided by two and total minus biggest
  set cost to the cheaper of singles only or the paired plan
  if best is nothing or cost is less than best then set best to cost
return best modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def min_cost_to_equalize(nums, cost1, cost2):
    top = max(nums)
    n = len(nums)
    value_sum = sum(nums)
    low = min(nums)
    balance = None
    for t in range(top, 3 * top + 4):
        biggest = t - low
        total = n * t - value_sum
        if 2 * biggest <= total:
            balance = t
            break
    candidates = {top, top + 1, top + 2}
    if balance is not None:
        candidates |= {balance - 1, balance, balance + 1, balance + 2}
    best = None
    for target in sorted(c for c in candidates if c >= top):
        deficits = [target - x for x in nums]
        total = sum(deficits)
        biggest = max(deficits)
        pairs = min(total // 2, total - biggest)
        singles_only = total * cost1
        paired = pairs * cost2 + (total - 2 * pairs) * cost1
        cost = min(singles_only, paired)
        if best is None or cost < best:
            best = cost
    return best % 1000000007
`
