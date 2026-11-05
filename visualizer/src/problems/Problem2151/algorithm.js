// LeetCode 2151: Maximum Good People Based on Statements.
// Assume a set of people is good. A good person tells the truth, so for each statement they make:
// a "good" claim needs that person to be good, a "bad" claim needs that person to be bad. Bad people may say
// anything, so they add no constraint. Try every subset of people as the good set; the largest valid one wins.

export function parseInput(text) {
  let statements
  try { statements = JSON.parse(text) } catch { throw new Error('Use an n x n JSON matrix of 0, 1 and 2, with 2 on the diagonal.') }
  const n = Array.isArray(statements) ? statements.length : 0
  if (n < 2 || n > 6) throw new Error('Use a matrix of 2 to 6 people.')
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(statements[i]) || statements[i].length !== n) throw new Error('The matrix must be square.')
    for (let j = 0; j < n; j++) {
      const v = statements[i][j]
      if (![0, 1, 2].includes(v) || (i === j && v !== 2)) throw new Error('Use 0 (bad), 1 (good) or 2 (no statement); the diagonal is 2.')
    }
  }
  return { statements }
}

export const code = `function maximumGood(statements) {
  const n = statements.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let valid = true
    for (let i = 0; i < n && valid; i++) {
      if (((mask >> i) & 1) === 0) continue
      for (let j = 0; j < n; j++) {
        const claim = statements[i][j]
        if (claim === 2) continue
        const isGood = ((mask >> j) & 1) === 1
        if ((claim === 1) !== isGood) {
          valid = false
          break
        }
      }
    }
    if (valid) best = Math.max(best, popcount(mask))
  }
  return best
}

function popcount(mask) {
  let count = 0
  for (let m = mask; m; m &= m - 1) count++
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: maximum_good
def maximum_good(statements):
    n = len(statements)
    best = 0
    for mask in range(1 << n):
        valid = True
        for i in range(n):
            if not (mask >> i) & 1:
                continue
            for j in range(n):
                claim = statements[i][j]
                if claim == 2:
                    continue
                is_good = bool((mask >> j) & 1)
                if (claim == 1) != is_good:
                    valid = False
                    break
            if not valid:
                break
        if valid:
            best = max(best, bin(mask).count("1"))
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'subset', label: 'Assume good set', description: 'Each subset of people is tried as the set of good people.' },
  { id: 'claim', label: 'Check claims', description: 'Every claim by a good person must hold under this assumption.' },
  { id: 'valid', label: 'Consistent', description: 'This assumption is consistent; it may be the answer.' },
  { id: 'broken', label: 'Contradiction', description: 'A good person would be telling a lie under this assumption.' },
  { id: 'done', label: 'Result', description: 'The largest consistent good set.' },
]

export function buildTrace({ statements }) {
  const frames = []
  const n = statements.length
  let best = 0
  const rows = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const label = Array.from({ length: n }, (_, i) => ((mask >> i) & 1 ? 'G' : 'b')).join(' ')
    let valid = true
    let reason = 'no claims broken'
    for (let i = 0; i < n && valid; i++) {
      if (((mask >> i) & 1) === 0) continue
      for (let j = 0; j < n; j++) {
        const claim = statements[i][j]
        if (claim === 2) continue
        const isGood = ((mask >> j) & 1) === 1
        if ((claim === 1) !== isGood) {
          valid = false
          reason = `person ${i} (good) says ${j} is ${claim === 1 ? 'good' : 'bad'}`
          break
        }
      }
    }
    const count = [...Array(n)].reduce((sum, _, i) => sum + ((mask >> i) & 1), 0)
    if (valid && count > best) best = count
    rows.push({ assumption: label, good: count, verdict: valid ? 'consistent' : reason })
    frames.push({ phase: valid ? 'valid' : 'broken', activeLine: L('if (valid) best'), pythonLine: P('if valid:'), message: valid ? `Assuming ${count} good people is consistent. Best so far ${best}.` : `Assuming this set is not consistent: ${reason}.`, rows: rows.slice(-8), best })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The most good people that fit the statements: ${best}.`, rows: rows.slice(-8), best })
  return { input: { statements }, result: best, frames }
}
