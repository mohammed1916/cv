const CODE = [
  'FUNCTION countOnes(n, queries)',
  '    mark ← n + 1 zeros',
  '    FOR each x in queries',
  '        mark[x] ← 1 - mark[x]   (a toggle on x also reaches its whole subtree)',
  '    parity ← n + 1 zeros',
  '    FOR i from 1 to n in increasing order',
  '        parity[i] ← parity[floor(i / 2)] XOR mark[i]',
  '    RETURN the number of i with parity[i] = 1',
]

const PY = [
  'def count_ones(n, queries):',
  '    mark = [0] * (n + 1)',
  '    for x in queries:',
  '        mark[x] ^= 1',
  '    parity = [0] * (n + 1)',
  '    for i in range(1, n + 1):',
  '        parity[i] = parity[i // 2] ^ mark[i]',
  '    return sum(parity[1:])',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Every node begins at zero.' },
  { id: 'mark', label: 'Mark', description: 'Each query toggles its own node; the subtree follows.' },
  { id: 'walk', label: 'Walk', description: 'Each node inherits its parent parity, then applies its own mark.' },
  { id: 'done', label: 'Result', description: 'Count the nodes with value one.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and queries.')
  const { n, queries } = input
  if (!Number.isInteger(n) || n < 1 || n > 31) throw new Error('n is an integer from 1 to 31 in this visualization.')
  if (!Array.isArray(queries) || queries.length > 10) throw new Error('queries is a list of at most 10 node numbers.')
  if (!queries.every(x => Number.isInteger(x) && x >= 1 && x <= n)) throw new Error('Each query names a node from 1 to n.')
  return { n, queries }
}

export function buildTrace({ n, queries }) {
  const mark = Array(n + 1).fill(0)
  const parity = Array(n + 1).fill(0)
  const frames = []
  frames.push({ pythonLine: pyLine('mark = [0] * (n + 1)'), phase: 'start', activeLine: codeLine('mark ← n + 1 zeros'), node: null, mark: [...mark], parity: null, shownUpTo: 0, message: `A complete binary tree with ${n} nodes. Every node starts at 0.` })
  for (const x of queries) {
    mark[x] ^= 1
    frames.push({ pythonLine: pyLine('mark[x] ^= 1'), phase: 'mark', activeLine: codeLine('mark[x] ← 1 - mark[x]   (a toggle on x also reaches its whole subtree)'), node: x, mark: [...mark], parity: null, shownUpTo: 0, message: `Query ${x} toggles node ${x} and its subtree.` })
  }
  for (let i = 1; i <= n; i++) {
    parity[i] = parity[Math.floor(i / 2)] ^ mark[i]
    frames.push({ pythonLine: pyLine('parity[i] = parity[i // 2] ^ mark[i]'), phase: 'walk', activeLine: codeLine('parity[i] ← parity[floor(i / 2)] XOR mark[i]'), node: i, mark: [...mark], parity: parity.map((v, k) => (k <= i ? v : null)), shownUpTo: i, message: `Node ${i} takes parent ${Math.floor(i / 2) || 'none'}'s parity ${Math.floor(i / 2) ? parity[Math.floor(i / 2)] : 0} XOR its mark ${mark[i]}, giving ${parity[i]}.` })
  }
  const ones = parity.slice(1).reduce((a, b) => a + b, 0)
  frames.push({ pythonLine: pyLine('return sum(parity[1:])'), phase: 'done', activeLine: codeLine('RETURN the number of i with parity[i] = 1'), node: null, mark: [...mark], parity: [...parity], shownUpTo: n, message: `${ones} node${ones === 1 ? ' has' : 's have'} value one.` })
  return { input: { n, queries }, result: ones, parity: parity.slice(1), frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
