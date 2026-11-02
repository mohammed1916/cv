// LeetCode 2307: Check for Contradictions in Equations.
// An equation x / y = v is handled with a weighted union-find: every variable stores its ratio to its
// parent. Ratios are exact fractions (integer numerator and denominator), so no float tolerance is used.
// A contradiction is an equation between two variables already in one group whose ratio disagrees.

const MAX_EQUATIONS = 8
const MAX_VALUE = 20

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const frac = (n, d) => {
  const g = gcd(n, d) || 1
  const sign = d < 0 ? -1 : 1
  return { n: (sign * n) / g, d: (sign * d) / g }
}
const mul = (a, b) => frac(a.n * b.n, a.d * b.d)
const div = (a, b) => frac(a.n * b.d, a.d * b.n)
const same = (a, b) => a.n * b.d === b.n * a.d
const text = a => (a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`)

export function parseInput(input) {
  let data
  try { data = JSON.parse(input) } catch { throw new Error('Use an object like {"equations":[["a","b",2],["b","c",3]]}.') }
  const equations = data && data.equations
  if (!Array.isArray(equations) || equations.length < 1 || equations.length > MAX_EQUATIONS) throw new Error(`Use 1 to ${MAX_EQUATIONS} equations. The visualization caps the count at ${MAX_EQUATIONS}.`)
  for (const eq of equations) {
    if (!Array.isArray(eq) || eq.length !== 3 || typeof eq[0] !== 'string' || typeof eq[1] !== 'string' || !/^[a-z]{1,8}$/.test(eq[0]) || !/^[a-z]{1,8}$/.test(eq[1])) throw new Error('Each equation is [x, y, value] with lowercase variable names.')
    if (!Number.isInteger(eq[2]) || eq[2] < 1 || eq[2] > MAX_VALUE) throw new Error(`Each ratio is an integer from 1 to ${MAX_VALUE}. The visualization uses exact integer ratios.`)
  }
  return { equations }
}

export const code = `FUNCTION hasContradiction(equations)
    parent[x] ← x and weight[x] ← 1 for every variable (weight is x / parent)
    FOR each equation x / y = v
        rx, ratioX ← find(x)   (ratioX is x / rx)
        ry, ratioY ← find(y)   (ratioY is y / ry)
        IF rx = ry
            IF ratioX is not v times ratioY THEN RETURN true
        ELSE
            parent[rx] ← ry
            weight[rx] ← v times ratioY divided by ratioX
    RETURN false`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def check_contradictions(equations):
    parent = {}
    weight = {}
    def find(x):
        ratio = (1, 1)
        while parent[x] != x:
            ratio = (ratio[0] * weight[x][0], ratio[1] * weight[x][1])
            x = parent[x]
        return x, ratio
    for x, y, v in equations:
        parent.setdefault(x, x)
        parent.setdefault(y, y)
        weight.setdefault(x, (1, 1))
        weight.setdefault(y, (1, 1))
        rx, rat_x = find(x)
        ry, rat_y = find(y)
        if rx == ry:
            if rat_x[0] * rat_y[1] != v * rat_y[0] * rat_x[1]:
                return True
        else:
            parent[rx] = ry
            weight[rx] = (v * rat_y[0] * rat_x[1], rat_y[1] * rat_x[0])
    return False
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
  { id: 'start', label: 'Groups', description: 'Every variable starts in its own group.' },
  { id: 'merge', label: 'Merge', description: 'Join two groups using the equation.' },
  { id: 'check', label: 'Check', description: 'Both variables are already connected: compare the ratios.' },
  { id: 'done', label: 'Result', description: 'Whether a contradiction exists.' },
]

function find(parent, weight, x) {
  let ratio = { n: 1, d: 1 }
  let cur = x
  while (parent.get(cur) !== cur) {
    ratio = mul(ratio, weight.get(cur))
    cur = parent.get(cur)
  }
  return { root: cur, ratio }
}

function snapshot(parent, weight, names) {
  return names.map(name => {
    const { root, ratio } = find(parent, weight, name)
    return { name, root, ratio: text(ratio) }
  })
}

export function buildTrace({ equations }) {
  const names = [...new Set(equations.flatMap(([x, y]) => [x, y]))].sort()
  const parent = new Map(names.map(name => [name, name]))
  const weight = new Map(names.map(name => [name, { n: 1, d: 1 }]))
  const frames = []
  frames.push({ phase: 'start', activeLine: L('parent[x] ← x'), pythonLine: P('parent = {}'), message: `${names.length} variables, each in its own group.`, eq: null, groups: snapshot(parent, weight, names), contradiction: false })
  let contradiction = false
  for (const [x, y, v] of equations) {
    const fx = find(parent, weight, x)
    const fy = find(parent, weight, y)
    if (fx.root === fy.root) {
      const ok = same(fx.ratio, mul({ n: v, d: 1 }, fy.ratio))
      contradiction = !ok
      frames.push({ phase: 'check', activeLine: L(ok ? 'IF rx = ry' : 'IF ratioX is not v'), pythonLine: P(ok ? 'if rx == ry' : 'if rat_x[0] * rat_y[1]'), message: `${x} / ${y} = ${v}: both already in one group. Implied ${text(div(fx.ratio, fy.ratio))}, ${ok ? 'consistent' : 'contradiction'}.`, eq: [x, y, v], groups: snapshot(parent, weight, names), contradiction })
      if (!ok) break
    } else {
      const w = div(mul({ n: v, d: 1 }, fy.ratio), fx.ratio)
      parent.set(fx.root, fy.root)
      weight.set(fx.root, w)
      frames.push({ phase: 'merge', activeLine: L('parent[rx] ← ry'), pythonLine: P('parent[rx] = ry'), message: `${x} / ${y} = ${v}: group of ${fx.root} joins group of ${fy.root}.`, eq: [x, y, v], groups: snapshot(parent, weight, names), contradiction: false })
    }
  }
  frames.push({ phase: 'done', activeLine: L('RETURN'), pythonLine: P('return True'), message: contradiction ? 'The equations contradict each other.' : 'No contradiction among the equations.', eq: null, groups: snapshot(parent, weight, names), contradiction })
  return { input: { equations }, result: contradiction, frames }
}
