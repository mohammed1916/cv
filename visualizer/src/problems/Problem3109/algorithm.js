const CODE_TEXT = `function indexOfPermutation(perm) {
  const MOD = 1000000007
  const n = perm.length
  const fact = [1]
  for (let i = 1; i <= n; i++) fact[i] = (fact[i - 1] * i) % MOD
  let unused = Array.from({ length: n }, (_, i) => i + 1)
  let rank = 0
  for (let i = 0; i < n; i++) {
    const v = perm[i]
    const smaller = unused.filter(u => u < v).length
    rank = (rank + smaller * fact[n - 1 - i]) % MOD
    unused = unused.filter(u => u !== v)
  }
  return rank
}`

const PYTHON_TEXT = `MOD = 1000000007

def index_of_permutation(perm):
    n = len(perm)
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % MOD
    unused = list(range(1, n + 1))
    rank = 0
    for i, v in enumerate(perm):
        smaller = sum(1 for u in unused if u < v)
        rank = (rank + smaller * fact[n - 1 - i]) % MOD
        unused.remove(v)
    return rank`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

const MOD = 1000000007

export function parseInput(text) {
  const perm = JSON.parse(text)
  if (!Array.isArray(perm) || perm.length < 1 || perm.length > 8) throw new Error('Use a JSON array holding a permutation of 1 to 8 integers.')
  const sorted = [...perm].sort((a, b) => a - b)
  if (!sorted.every((v, i) => v === i + 1)) throw new Error('The array must be a permutation of 1 to n.')
  return perm
}

export function buildTrace(perm) {
  const n = perm.length
  const frames = []
  const fact = [1]
  for (let i = 1; i <= n; i++) fact[i] = (fact[i - 1] * i) % MOD
  let unused = Array.from({ length: n }, (_, i) => i + 1)
  let rank = 0
  frames.push({ phase: 'start', activeLine: L('const MOD = 1000000007'), pythonLine: PY('MOD = 1000000007'), i: -1, value: null, smaller: null, weight: null, unused: [...unused], rank, message: `Start with rank 0 and ${n} unused values.` })
  for (let i = 0; i < n; i++) {
    const v = perm[i]
    const smaller = unused.filter(u => u < v).length
    const weight = fact[n - 1 - i]
    const before = rank
    rank = (rank + smaller * weight) % MOD
    frames.push({ phase: 'count', activeLine: L('const smaller = unused.filter'), pythonLine: PY('smaller = sum'), i, value: v, smaller, weight, unused: [...unused], rank: before, message: `Position ${i} holds ${v}; ${smaller} unused value${smaller === 1 ? ' is' : 's are'} smaller, worth ${smaller} times ${n - 1 - i}!.` })
    unused = unused.filter(u => u !== v)
    frames.push({ phase: 'add', activeLine: L('rank = (rank + smaller'), pythonLine: PY('rank = (rank'), i, value: v, smaller, weight, unused: [...unused], rank, message: `Rank is now ${rank}; ${v} is used up.` })
  }
  frames.push({ phase: 'done', activeLine: L('return rank'), pythonLine: PY('return rank'), i: -1, value: null, smaller: null, weight: null, unused: [], rank, message: `The zero-based rank is ${rank}.` })
  return { input: perm, result: rank, frames }
}
