const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, t and k.')
  const { s, t, k } = input
  if (typeof s !== 'string' || typeof t !== 'string' || s.length < 2 || s.length > 6 || s.length !== t.length) throw new Error('s and t must be equal-length strings of 2 to 6 letters.')
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) throw new Error('Use lowercase letters a to z only.')
  if (!Number.isInteger(k) || k < 1 || k > 8) throw new Error('k must be an integer from 1 to 8.')
  return { s, t, k }
}

const rotate = (s, l) => s.slice(s.length - l) + s.slice(0, s.length - l)

export function buildTrace({ s, t, k }) {
  const n = s.length
  const frames = []
  let p = 0
  for (let l = 0; l < n; l++) if (rotate(s, l) === t) p++
  frames.push({ phase: 'count', activeLine: L('count how many rotations'), step: 0, ways: null, total: null, message: `${p} of the ${n} rotations of s equal t.` })
  if (p === 0) {
    frames.push({ phase: 'done', activeLine: L('if p is 0'), step: 0, ways: 0, total: null, message: 't is not a rotation of s, so no sequence works.' })
    return { input: { s, t, k }, result: 0, frames }
  }
  let ways = s === t ? 1 : 0
  let total = 1
  frames.push({ phase: 'start', activeLine: L('set ways to 1'), step: 0, ways, total, message: `Start: ${ways} way${ways === 1 ? '' : 's'} to be at t, ${total} sequence.` })
  for (let step = 1; step <= k; step++) {
    ways = ((p - 1) * ways + p * ((total - ways + MOD) % MOD)) % MOD
    total = ((n - 1) * total) % MOD
    frames.push({ phase: 'step', activeLine: L('set ways to (p minus 1)'), step, ways, total, message: `After ${step} operation${step === 1 ? '' : 's'}: ${ways} sequences end at t.` })
  }
  frames.push({ phase: 'done', activeLine: L('return ways'), step: k, ways, total, message: `Ways in exactly ${k} operations: ${ways}.` })
  return { input: { s, t, k }, result: ways, frames }
}

export const code = `ways to turn s into t in exactly k operations
  let n be the length of s
  count how many rotations l from 0 to n minus 1 turn s into t, and call the count p
  if p is 0 then return 0
  set ways to 1 if s equals t, otherwise 0
  set total to 1
  repeat k times
    set ways to (p minus 1) times ways plus p times (total minus ways), modulo 1000000007
    set total to (n minus 1) times total, modulo 1000000007
  return ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_transformations(s, t, k):
    MOD = 1000000007
    n = len(s)
    p = 0
    for l in range(n):
        if s[n - l:] + s[:n - l] == t:
            p += 1
    if p == 0:
        return 0
    ways = 1 if s == t else 0
    total = 1
    for _ in range(k):
        ways = ((p - 1) * ways + p * (total - ways)) % MOD
        total = ((n - 1) * total) % MOD
    return ways
`
