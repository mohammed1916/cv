// Teaching rule: remember the last face and how many times in a row it has appeared. Switching faces always starts a new run; repeating a face extends its run only while that face's limit allows.

export const phases = [
  { id: 'start', label: 'Roll 1', description: 'The first roll can show any face, starting a run of length one.' },
  { id: 'inspect', label: 'Read runs', description: 'Read how many sequences currently end in each face at each run length.' },
  { id: 'update', label: 'Next roll', description: 'Switching faces starts a run of one. Repeating a face shifts its run length up, if its limit allows.' },
  { id: 'done', label: 'Total', description: 'Add every sequence length n, modulo 1000000007.' },
]

const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 4, "rollMax": [1,1,2,2,3,3]}.')
  const { n, rollMax } = input
  if (!Number.isInteger(n) || n < 1 || n > 5000) throw new Error('n must be an integer from 1 to 5000.')
  if (!Array.isArray(rollMax) || rollMax.length !== 6 || !rollMax.every(v => Number.isInteger(v) && v >= 1 && v <= 15)) throw new Error('rollMax must be six integers from 1 to 15, one for each face.')
  return { n, rollMax }
}

const copyRuns = runs => runs.map(row => [...row])

export function buildTrace({ n, rollMax }) {
  const frames = []
  // runs[f][k] = number of sequences so far that end with face f (0-based) in a run of exactly k rolls.
  let runs = rollMax.map((limit, f) => Array.from({ length: limit + 1 }, (_, k) => (k === 1 ? 1 : 0)))
  frames.push({
    phase: 'start', activeLine: L('runs[f][1] = 1'), pythonLine: P('runs = ['),
    message: 'After one roll every face has one sequence, a run of length one.',
    snapshot: { length: 1, runs: copyRuns(runs), total: 6 },
  })
  for (let length = 2; length <= n; length++) {
    const total = runs.reduce((sum, row) => row.reduce((s, c) => (s + c) % MOD, sum), 0)
    frames.push({
      phase: 'inspect', activeLine: L('total = sum'), pythonLine: P('total = sum'),
      message: `Read the ${length - 1}-roll sequences: ${total} in all, counting every face and run length.`,
      snapshot: { length: length - 1, runs: copyRuns(runs), total },
    })
    runs = runs.map((row, f) => {
      const endingHere = row.reduce((s, c) => (s + c) % MOD, 0)
      const next = Array.from({ length: rollMax[f] + 1 }, () => 0)
      next[1] = ((total - endingHere) % MOD + MOD) % MOD
      for (let k = 1; k < rollMax[f]; k++) next[k + 1] = row[k]
      return next
    })
    frames.push({
      phase: 'update', activeLine: L('next[f][1] = total'), pythonLine: P('row[1] ='),
      message: `Length ${length}: face runs of length one take every sequence that ends in another face. Longer runs shift up, up to each face's limit.`,
      snapshot: { length, runs: copyRuns(runs), total: runs.reduce((sum, row) => row.reduce((s, c) => (s + c) % MOD, sum), 0) },
    })
  }
  const result = runs.reduce((sum, row) => row.reduce((s, c) => (s + c) % MOD, sum), 0)
  frames.push({
    phase: 'done', activeLine: L('return sum of every'), pythonLine: P('return sum(map'),
    message: `Total sequences of length ${n}: ${result}.`,
    snapshot: { length: n, runs: copyRuns(runs), total: result },
  })
  return { input: { n, rollMax }, result, frames }
}

const codeLines = `count die sequences (n, rollMax):
  runs[f][k] = 0 for all faces f and run lengths k
  runs[f][1] = 1 for each face f
  for length from 2 to n:
    total = sum of every runs[f][k]
    next[f][1] = total - sum of runs[f][k] over all k
    next[f][k + 1] = runs[f][k] while k + 1 <= rollMax[f]
    runs = next
  return sum of every runs[f][k] modulo 1000000007`.split('\n')

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 1_000_000_007

def die_simulation(n, roll_max):
    runs = [[1 if k == 1 else 0 for k in range(limit + 1)] for limit in roll_max]
    for _ in range(n - 1):
        total = sum(map(sum, runs)) % MOD
        nxt = []
        for f, limit in enumerate(roll_max):
            row = [0] * (limit + 1)
            row[1] = (total - sum(runs[f])) % MOD
            for k in range(1, limit):
                row[k + 1] = runs[f][k]
            nxt.append(row)
        runs = nxt
    return sum(map(sum, runs)) % MOD`

const pyLines = python.split('\n')
const L = s => {
  const i = codeLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing code line: ${s}`)
  return i + 1
}
const P = s => {
  const i = pyLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
