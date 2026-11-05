export const phases = [
  { id: 'start', label: 'First row', description: 'Any single row is either an ABA pattern (two colors) or an ABC pattern (three colors). There are six of each.' },
  { id: 'inspect', label: 'Next row options', description: 'An ABA row has 3 compatible ABA rows and 2 compatible ABC rows; an ABC row has 2 of each kind.' },
  { id: 'update', label: 'Carry totals', description: 'Replace the two category totals with the totals for the new row, keeping the remainder modulo 1,000,000,007.' },
  { id: 'done', label: 'Complete', description: 'Add the two categories for the last row.' },
]

const MOD = 1000000007

export function parseInput(text) {
  const n = Number(text.trim())
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new Error('Enter the number of rows as an integer from 1 to 60.')
  return n
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(n) {
  let aba = 6
  let abc = 6
  const frames = [{
    phase: 'start', activeLine: L('let aba = 6'), pythonLine: P('aba = 6'),
    snapshot: { row: 1, aba, abc },
    message: 'Row 1 can be ABA in 6 ways (3 choices for the first color, 2 for the second) or ABC in 6 ways (every order of three colors).',
  }]
  for (let row = 2; row <= n; row++) {
    const rawAba = 3 * aba + 2 * abc
    const rawAbc = 2 * aba + 2 * abc
    const nextAba = rawAba % MOD
    const nextAbc = rawAbc % MOD
    frames.push({
      phase: 'inspect', activeLine: L('const nextAba ='), pythonLine: P('next_aba ='),
      snapshot: { row, aba, abc, nextAba, nextAbc },
      message: `Row ${row}: new ABA rows = 3×${aba} + 2×${abc} = ${rawAba}; new ABC rows = 2×${aba} + 2×${abc} = ${rawAbc}.`,
    })
    aba = nextAba
    abc = nextAbc
    frames.push({
      phase: 'update', activeLine: L('aba = nextAba'), pythonLine: P('aba, abc ='),
      snapshot: { row, aba, abc },
      message: `Row ${row} totals: ${aba} ABA-type and ${abc} ABC-type colorings ending in this row.`,
    })
  }
  const result = (aba + abc) % MOD
  frames.push({
    phase: 'done', activeLine: L('return (aba'), pythonLine: P('return (aba'),
    snapshot: { row: n, aba, abc, total: result },
    message: `Total colorings for ${n} row${n === 1 ? '' : 's'}: ${result}.`,
  })
  return { input: n, result, frames }
}

export const code = `const MOD = 1000000007

function numOfWays(n) {
  let aba = 6
  let abc = 6
  for (let row = 2; row <= n; row++) {
    const nextAba = (3 * aba + 2 * abc) % MOD
    const nextAbc = (2 * aba + 2 * abc) % MOD
    aba = nextAba
    abc = nextAbc
  }
  return (aba + abc) % MOD
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 1000000007

def count_colorings(n):
    aba = 6
    abc = 6
    for _ in range(2, n + 1):
        next_aba = (3 * aba + 2 * abc) % MOD
        next_abc = (2 * aba + 2 * abc) % MOD
        aba, abc = next_aba, next_abc
    return (aba + abc) % MOD
`
