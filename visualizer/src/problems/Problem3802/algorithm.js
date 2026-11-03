const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, limitA and limitB.')
  const { n, limitA, limitB } = input
  if (!Number.isInteger(n) || n < 2 || n > 14) throw new Error('n is an integer from 2 to 14.')
  if (![limitA, limitB].every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('Each limit is an integer from 1 to n.')
  return { n, limitA, limitB }
}

export const code = `count two-colour paintings of n sheets
  total = 0
  for x from 1 to n minus 1, the length of the first segment
    y = n minus x
    if colour A first fits: x at most limitA and y at most limitB
      total = total + 1
    if colour B first fits: x at most limitB and y at most limitA
      total = total + 1
  return total mod M`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def ways_to_paint(n, limit_a, limit_b):
    MOD = 1000000007
    total = 0
    for x in range(1, n):
        y = n - x
        if x <= limit_a and y <= limit_b:
            total += 1
        if x <= limit_b and y <= limit_a:
            total += 1
    return total % MOD`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ n, limitA, limitB }) {
  const frames = []
  let total = 0
  frames.push({ phase: 'start', x: 0, y: 0, aFirst: null, bFirst: null, total, limitA, limitB, n, pythonLine: Q('total = 0'), activeLine: L('total = 0'), message: `Sheets: ${n}. Colour A may cover at most ${limitA}; colour B at most ${limitB}.` })
  for (let x = 1; x <= n - 1; x++) {
    const y = n - x
    const aFirst = x <= limitA && y <= limitB
    const bFirst = x <= limitB && y <= limitA
    frames.push({ phase: 'split', x, y, aFirst: null, bFirst: null, total, limitA, limitB, n, pythonLine: Q('for x in range'), activeLine: L('for x from 1'), message: `Split after ${x} sheet${x === 1 ? '' : 's'}: first part ${x}, second part ${y}.` })
    if (aFirst) total++
    frames.push({ phase: 'checkA', x, y, aFirst, bFirst: null, total, limitA, limitB, n, pythonLine: Q('if x <= limit_a'), activeLine: L('if colour A first fits'), message: aFirst ? `A then B fits (${x} <= ${limitA}, ${y} <= ${limitB}).` : `A then B fails: a part is over its limit.` })
    if (bFirst) total++
    frames.push({ phase: 'checkB', x, y, aFirst, bFirst, total, limitA, limitB, n, pythonLine: Q('if x <= limit_b'), activeLine: L('if colour B first fits'), message: bFirst ? `B then A fits (${x} <= ${limitB}, ${y} <= ${limitA}).` : `B then A fails: a part is over its limit.` })
  }
  frames.push({ phase: 'done', x: n, y: 0, aFirst: null, bFirst: null, total: total % MOD, limitA, limitB, n, pythonLine: Q('return total % MOD'), activeLine: L('return total mod M'), message: `Distinct two-colour sequences: ${total % MOD}.` })
  return { input: { n, limitA, limitB }, result: total % MOD, frames }
}
