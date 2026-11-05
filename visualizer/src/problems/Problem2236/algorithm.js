export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with root, left and right.')
  const { root, left, right } = input
  for (const [name, v] of [['root', root], ['left', left], ['right', right]]) {
    if (!Number.isInteger(v) || v < -100 || v > 100) throw new Error(`${name} is an integer from -100 to 100.`)
  }
  return { root, left, right }
}

export function buildTrace({ root, left, right }) {
  const sum = left + right
  const result = root === sum
  const tree = { id: 'root', children: [{ id: 'left', children: [] }, { id: 'right', children: [] }] }
  const frames = []
  frames.push({ pythonLine: PL('def check_tree'), phase: 'setup', activeLine: CL('const sum'), root, left, right, sum: null, result: null, tree, roles: { root: 'focus' }, message: `The root holds ${root}. Its children hold ${left} and ${right}.` })
  frames.push({ pythonLine: PL('return root =='), phase: 'compare', activeLine: CL('return root === sum'), root, left, right, sum, result, tree, roles: { root: 'focus', left: 'target', right: 'target' }, message: `${left} + ${right} = ${sum}, ${result ? 'the same as' : 'not equal to'} the root ${root}.` })
  return { input: { root, left, right }, result, frames }
}

export const code = `function rootEqualsSum(root, left, right) {
  const sum = left + right;
  return root === sum;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def check_tree(root, left, right):
    return root == left + right
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
