const MOD = 1000000007

const CODE = [
  'FUNCTION countGood(s)',
  '    count[c] ← occurrences of each letter c in s',
  '    total ← 0',
  '    FOR k from 1 to the largest count',
  '        ways ← 1',
  '        FOR each letter c',
  '            ways ← ways × (1 + C(count[c], k))   (choose none of c, or exactly k of its positions)',
  '        total ← total + (ways − 1)   (remove the empty choice)',
  '    RETURN total modulo 1000000007',
]

const PY = [
  'from math import comb',
  'def count_good(s):',
  '    MOD = 1000000007',
  '    count = {}',
  '    for ch in s:',
  '        count[ch] = count.get(ch, 0) + 1',
  '    total = 0',
  '    for k in range(1, max(count.values()) + 1):',
  '        ways = 1',
  '        for c in count:',
  '            ways = ways * (1 + comb(count[c], k))',
  '        total = (total + ways - 1) % MOD',
  '    return total % MOD',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Count', description: 'Count how often each letter appears.' },
  { id: 'level', label: 'Level k', description: 'Every chosen letter must appear exactly k times.' },
  { id: 'done', label: 'Result', description: 'Sum the choices over all k.' },
]

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 20 lowercase letters in this visualization.')
  return s
}

// Pascal's triangle up to 20 for binomial coefficients.
function binomial(n, k) {
  const row = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let a = 0; a <= n; a++) {
    row[a][0] = 1
    for (let b = 1; b <= a; b++) row[a][b] = row[a - 1][b - 1] + row[a - 1][b]
  }
  return k <= n ? row[n][k] : 0
}

export function buildTrace(s) {
  const counts = {}
  for (const ch of s) counts[ch] = (counts[ch] || 0) + 1
  const letters = Object.keys(counts).sort()
  const maxCount = Math.max(...Object.values(counts))
  const frames = []
  frames.push({ pythonLine: pyLine('count[ch] = count.get(ch, 0) + 1'), phase: 'start', activeLine: codeLine('count[c] ← occurrences of each letter c in s'), k: null, letters, counts: letters.map(c => counts[c]), terms: [], ways: null, total: 0, message: `Letters present: ${letters.map(c => `${c}×${counts[c]}`).join(', ')}.` })
  let total = 0
  for (let k = 1; k <= maxCount; k++) {
    let ways = 1
    const terms = letters.map(c => binomial(counts[c], k))
    for (const t of terms) ways = (ways * (1 + t)) % MOD
    total = (total + ways - 1 + MOD) % MOD
    frames.push({ pythonLine: pyLine('ways = ways * (1 + comb(count[c], k))'), phase: 'level', activeLine: codeLine('ways ← ways × (1 + C(count[c], k))   (choose none of c, or exactly k of its positions)'), k, letters, counts: letters.map(c => counts[c]), terms, ways, total, message: `k = ${k}: each letter contributes 1 + C(count, ${k}). Product ${ways}, minus the empty choice gives ${ways - 1}. Running total ${total}.` })
  }
  frames.push({ pythonLine: pyLine('return total % MOD'), phase: 'done', activeLine: codeLine('RETURN total modulo 1000000007'), k: null, letters, counts: letters.map(c => counts[c]), terms: [], ways: null, total, message: `${total} good subsequence${total === 1 ? '' : 's'} modulo 1000000007.` })
  return { input: s, result: total, letters, counts: letters.map(c => counts[c]), frames }
}

export { binomial }
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
