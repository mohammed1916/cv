const MOD = 1000000007n

const CODE = [
  'maximum frequency score over all windows of length k',
  'counts are empty, score is 0 and best is 0',
  'for each index i in nums',
  '  add nums[i]: score changes by term(c + 1) minus term(c)',
  '  the count of v goes up by one',
  '  if i is at least k, remove the element leaving the window',
  '  if the window has length k, best is the larger of best and score',
  'return best',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def max_frequency_score(nums, k):',
  '    MOD = 1000000007',
  '    def term(x, f):',
  '        return pow(x, f, MOD) if f > 0 else 0',
  '    counts = {}',
  '    score = 0',
  '    best = 0',
  '    for i in range(len(nums)):',
  '        v = nums[i]',
  '        c = counts.get(v, 0)',
  '        score = (score + term(v, c + 1) - term(v, c)) % MOD',
  '        counts[v] = c + 1',
  '        if i >= k:',
  '            u = nums[i - k]',
  '            c = counts[u]',
  '            score = (score + term(u, c - 1) - term(u, c)) % MOD',
  '            counts[u] = c - 1',
  '        if i >= k - 1:',
  '            best = max(best, score)',
  '    return best',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}

// term(x, f) is x^f mod MOD, and an absent value (f = 0) contributes nothing.
const term = (x, f) => (f > 0 ? powMod(BigInt(x), f) : 0n)
function powMod(base, exp) {
  let result = 1n
  let b = base % MOD
  let e = exp
  while (e > 0) {
    if (e & 1) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1
  }
  return result
}
const norm = value => ((value % MOD) + MOD) % MOD

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 numbers for the visualization.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each number is a whole number from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is a whole number from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const counts = new Map()
  let score = 0n
  let best = 0n
  const windowOf = i => ({ from: Math.max(0, i - k + 1), to: i })
  const termsSnapshot = () => [...counts.entries()].filter(([, c]) => c > 0).map(([value, count]) => ({ value, count, term: term(value, count).toString() }))
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase,
    activeLine: L(codeKey),
    pythonLine: P(pyKey),
    message,
    score: score.toString(),
    best: best.toString(),
    terms: termsSnapshot(),
    ...state,
  })
  F('setup', 'counts are empty', 'counts = {}', 'No values are in the window yet; every term is 0.', { i: -1, v: null, leaving: null, window: null })
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i]
    const c = counts.get(v) ?? 0
    score = norm(score + term(v, c + 1) - term(v, c))
    counts.set(v, c + 1)
    F('add', 'add nums[i]', 'score = (score + term(v, c + 1)', `Add ${v}: its term changes from ${v}^${c} to ${v}^${c + 1}, so the score is now ${score}.`, { i, v, leaving: null, window: null })
    if (i >= k) {
      const u = nums[i - k]
      const d = counts.get(u)
      score = norm(score + term(u, d - 1) - term(u, d))
      counts.set(u, d - 1)
      F('remove', 'if i is at least k', 'score = (score + term(u, c - 1)', `Index ${i - k} (${u}) leaves the window; the score is now ${score}.`, { i, v, leaving: i - k, window: null })
    }
    if (i >= k - 1) {
      const w = windowOf(i)
      if (score > best) best = score
      F('window', 'if the window has length k', 'best = max(best, score)', `Window [${w.from}..${w.to}] scores ${score}; the best so far is ${best}.`, { i, v, leaving: null, window: w })
    }
  }
  F('done', 'return best', 'return best', `The maximum frequency score is ${best}.`, { i: -1, v: null, leaving: null, window: null })
  return { input: { nums, k }, result: Number(best), frames }
}
