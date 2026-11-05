export const phases = [
  { id: 'start', label: 'Count residues', description: 'Only each stone value modulo 3 matters; count the stones in residue 0, 1 and 2.' },
  { id: 'rule', label: 'Parity of zeros', description: 'With an even number of residue-0 stones, Alice needs one stone from each of the other residues.' },
  { id: 'odd', label: 'Odd zeros', description: 'With an odd number of residue-0 stones, the counts of residues 1 and 2 must differ by more than 2.' },
  { id: 'done', label: 'Result', description: 'Alice wins exactly when the chosen condition holds.' },
]

export const code = `function stoneGameIX(stones) {
  const count = [0, 0, 0]
  for (const v of stones) count[v % 3]++
  if (count[0] % 2 === 0) return count[1] >= 1 && count[2] >= 1
  return Math.abs(count[1] - count[2]) > 2
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def stone_game_ix(stones):
    count = [0, 0, 0]
    for v in stones:
        count[v % 3] += 1
    if count[0] % 2 == 0:
        return count[1] >= 1 and count[2] >= 1
    return abs(count[1] - count[2]) > 2
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let stones
  try { stones = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [2,1].') }
  if (!Array.isArray(stones) || stones.length < 1 || stones.length > 60 || !stones.every(v => Number.isInteger(v) && v >= 1 && v <= 10000)) {
    throw new Error('stones must have 1 to 60 whole numbers from 1 to 10000.')
  }
  return stones
}

export function buildTrace(stones) {
  const frames = []
  const count = [0, 0, 0]
  for (const v of stones) count[v % 3]++
  const add = (phase, c, p, message) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { stones, count: count.slice() },
  })
  add('start', 'const count = [0, 0, 0]', 'count = [0, 0, 0]', `Residues: ${count[0]} with 0, ${count[1]} with 1, ${count[2]} with 2.`)
  let result
  if (count[0] % 2 === 0) {
    result = count[1] >= 1 && count[2] >= 1
    add('rule', 'if (count[0] % 2 === 0)', 'if count[0] % 2 == 0', `Zeros are even, so Alice wins only if both other residues are present: ${result}.`)
  } else {
    result = Math.abs(count[1] - count[2]) > 2
    add('odd', 'return Math.abs', 'return abs(', `Zeros are odd; the gap between residues 1 and 2 is ${Math.abs(count[1] - count[2])}, so Alice wins: ${result}.`)
  }
  add('done', 'return count[1] >= 1', 'return count[1] >= 1', `Alice wins: ${result}.`)
  return { input: stones, result, frames }
}
