export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and target.')
  const { n, target } = input
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10 for this visualization.')
  if (!Number.isInteger(target) || Math.abs(target) > 55) throw new Error('target is an integer from -55 to 55.')
  return { n, target }
}

// Can the values in `unused` (absolute values) be signed so they sum to `need`?
// Choosing a set N to negate gives sum(unused) - 2 * sum(N) = need, so sum(N) must be reachable.
function canFinish(unused, need) {
  const total = unused.reduce((a, b) => a + b, 0)
  const diff = total - need
  if (diff < 0 || diff % 2 !== 0) return false
  const want = diff / 2
  const reach = new Set([0])
  for (const v of unused) for (const r of [...reach]) reach.add(r + v)
  return reach.has(want)
}

export function buildTrace({ n, target }) {
  const frames = []
  const all = Array.from({ length: n }, (_, k) => k + 1)
  const chosen = []
  let unused = all.slice()
  let need = target
  frames.push({ pythonLine: PL('unused = set'), phase: 'start', activeLine: L('absolute values 1 to n'), at: -1, chosen: [], need, message: `Need signed values 1 to ${n} summing to ${target}.` })
  if (!canFinish(unused, need)) {
    frames.push({ pythonLine: PL('return []'), phase: 'empty', activeLine: L('then return empty'), at: -1, chosen: [], need, message: 'No signed permutation reaches the target, so the answer is empty.' })
    return { input: { n, target }, result: [], frames }
  }
  for (let pos = 0; pos < n; pos++) {
    const candidates = unused.flatMap(v => [-v, v]).sort((a, b) => a - b)
    let picked = null
    for (const c of candidates) {
      const rest = unused.filter(v => v !== Math.abs(c))
      const ok = canFinish(rest, need - c)
      frames.push({ pythonLine: PL('if can_finish'), phase: 'try', activeLine: L('smallest value that still works'), at: pos, chosen: [...chosen], need,
        message: ok ? `Trying ${c} at position ${pos}: the rest can still reach the target.` : `Trying ${c} at position ${pos} leaves no valid completion.` })
      if (ok) { picked = c; break }
    }
    chosen.push(picked)
    unused = unused.filter(v => v !== Math.abs(picked))
    need -= picked
    frames.push({ pythonLine: PL('chosen.append'), phase: 'keep', activeLine: L('is kept'), at: pos, chosen: [...chosen], need, message: `Keep ${picked} at position ${pos}; remaining target ${need}.` })
  }
  frames.push({ pythonLine: PL('return chosen'), phase: 'done', activeLine: L('return the array'), at: -1, chosen: [...chosen], need, message: `Lexicographically smallest: [${chosen.join(', ')}].` })
  return { input: { n, target }, result: chosen, frames }
}

export const code = `lexicographically smallest signed permutation with a given sum
  if no signing of 1 to n reaches target then return empty
  unused is the set of absolute values 1 to n
  need is target
  for each position from left to right
    try the candidate values in increasing order
    the smallest value that still works is kept
  return the array`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_negated_permutation(n, target):
    unused = set(range(1, n + 1))
    if not can_finish(unused, target):
        return []
    chosen = []
    need = target
    for _ in range(n):
        for c in sorted(v for x in unused for v in (-x, x)):
            rest = unused - {abs(c)}
            if can_finish(rest, need - c):
                break
        chosen.append(c)
        unused = rest
        need -= c
    return chosen
`
const PL = s => python.split('\n').findIndex(c => c.includes(s)) + 1
