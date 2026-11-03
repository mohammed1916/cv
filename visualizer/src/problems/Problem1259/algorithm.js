// LeetCode 1259: Handshakes That Don't Cross. Person 0 shakes hands with some person 2i + 1.
// That chord splits the rest into two arcs: 2i people inside and 2(p - 1 - i) outside. The two
// arcs can be paired independently without crossing the chord, so the counts multiply and the
// Catalan recurrence sums over the split point.
const MOD = 1000000007n
const MAX_PEOPLE = 20

export const phases = [
  { id: 'setup', label: 'Circle', description: 'Read the number of people.' },
  { id: 'base', label: 'Base', description: 'Zero people leave one way to pair.' },
  { id: 'row', label: 'Size', description: 'Count pairings for a circle of 2p people.' },
  { id: 'split', label: 'Split', description: 'Person 0 shakes hands with 2i + 1.' },
  { id: 'store', label: 'Store', description: 'Add this split into the total.' },
  { id: 'done', label: 'Answer', description: 'Report the pairings modulo 1000000007.' },
]

export const code = `FUNCTION countHandshakes(n)
    m ← n / 2
    dp[0] ← 1
    FOR p from 1 to m
        dp[p] ← 0
        FOR i from 0 to p - 1
            dp[p] ← (dp[p] + dp[i] * dp[p - 1 - i]) mod 1000000007
    RETURN dp[m]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `MOD = 1000000007


def count_handshakes(n):
    m = n // 2
    dp = [1]
    for p in range(1, m + 1):
        total = 0
        for i in range(p):
            total = (total + dp[i] * dp[p - 1 - i]) % MOD
        dp.append(total)
    return dp[m]


if __name__ == "__main__":
    import sys, json
    print(json.dumps(count_handshakes(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const n = typeof text === 'string' ? JSON.parse(text) : text
  if (!Number.isInteger(n) || n < 2 || n > MAX_PEOPLE || n % 2 !== 0) {
    throw new Error(`numPeople is an even integer from 2 to ${MAX_PEOPLE}.`)
  }
  return n
}

export function buildTrace(n) {
  const frames = []
  const m = n / 2
  const dp = [1n]
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    p: -1, i: -1, term: null, total: null, dp: dp.map(String), people: 0, partner: -1, ...extra,
  })
  emit('setup', 'm ← n / 2', 'm = n // 2', `${n} people make ${m} handshake pairs.`, { people: 0 })
  emit('base', 'dp[0] ← 1', 'dp = [1]', 'With no people left there is exactly one empty pairing.', { p: 0, total: '1' })
  for (let p = 1; p <= m; p += 1) {
    let total = 0n
    emit('row', 'FOR p from 1 to m', 'for p in range(1, m + 1)', `Circle of ${2 * p} people: count pairings with the chord from person 0.`, { p, people: 2 * p, total: '0' })
    for (let i = 0; i < p; i += 1) {
      const term = (dp[i] * dp[p - 1 - i]) % MOD
      emit('split', 'FOR i from 0 to p - 1', 'for i in range(p)', `Person 0 shakes person ${2 * i + 1}: ${2 * i} people inside, ${2 * (p - 1 - i)} outside. Term ${dp[i]} × ${dp[p - 1 - i]} = ${term}.`,
        { p, i, people: 2 * p, partner: 2 * i + 1, term: String(term), total: String(total) })
      total = (total + term) % MOD
      emit('store', 'dp[p] ← (dp[p] + dp[i] * dp[p - 1 - i]) mod 1000000007', 'total = (total + dp[i] * dp[p - 1 - i]) % MOD',
        `Running total for ${2 * p} people is ${total}.`, { p, i, people: 2 * p, partner: 2 * i + 1, term: String(term), total: String(total) })
    }
    dp.push(total)
    emit('row', 'dp[p] ← (dp[p] + dp[i] * dp[p - 1 - i]) mod 1000000007', 'dp.append(total)', `dp[${p}] = ${total} pairings for ${2 * p} people.`, { p, people: 2 * p, total: String(total) })
  }
  const result = dp[m]
  emit('done', 'RETURN dp[m]', 'return dp[m]', `${result} non-crossing pairings for ${n} people, modulo 1000000007.`, { p: m, people: n, total: String(result) })
  return { input: n, result: Number(result), frames }
}
