const TOLERANCE = 1e-5
const NAME = /^[a-z]{1,5}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.equations) || !Array.isArray(input.values)) throw new Error('Use an object with equations and values.')
  const { equations, values } = input
  if (equations.length < 1 || equations.length > 10) throw new Error('equations has 1 to 10 pairs.')
  if (equations.length !== values.length) throw new Error('equations and values have the same length.')
  if (!equations.every(e => Array.isArray(e) && e.length === 2 && e.every(n => typeof n === 'string' && NAME.test(n)))) throw new Error('Each equation is two lowercase names of 1 to 5 letters.')
  if (!values.every(v => typeof v === 'number' && v > 0 && v <= 10 && Math.round(v * 100) === v * 100)) throw new Error('Each value is above 0, at most 10, with at most 2 decimals.')
  return { equations, values }
}

export function buildTrace({ equations, values }) {
  const parent = new Map()
  const weight = new Map()
  const frames = []
  const snapshot = () => [...parent.keys()].map(x => ({ name: x, parent: parent.get(x), ratio: weight.get(x) }))
  const find = x => {
    if (!parent.has(x)) { parent.set(x, x); weight.set(x, 1) }
    if (parent.get(x) === x) return [x, 1]
    const [root, r] = find(parent.get(x))
    weight.set(x, weight.get(x) * r)
    parent.set(x, root)
    return [root, weight.get(x)]
  }
  let result = false
  frames.push({ pythonLine: PL('parent = {}'), phase: 'setup', activeLine: CL('const parent = new Map()'), at: -1, rows: [], message: `Start with no variables. Each equation says a / b = value.` })
  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i]
    const v = values[i]
    const [ra, ratioA] = find(a)
    const [rb, ratioB] = find(b)
    if (ra === rb) {
      const implied = ratioA / ratioB
      const ok = Math.abs(implied - v) < TOLERANCE
      frames.push({ pythonLine: PL('if abs('), phase: 'check', activeLine: CL('const implied'), at: i, rows: snapshot(), message: `${a} / ${b} is already known as ${implied.toFixed(4)}; the equation says ${v}. ${ok ? 'They agree.' : 'Contradiction.'}`, contradiction: !ok })
      if (!ok) { result = true; break }
    } else {
      parent.set(ra, rb)
      weight.set(ra, v * ratioB / ratioA)
      frames.push({ pythonLine: PL('weight[ra] ='), phase: 'join', activeLine: CL('weight.set(ra'), at: i, rows: snapshot(), message: `Join the groups of ${a} and ${b} using ${a} / ${b} = ${v}.`, contradiction: false })
    }
  }
  frames.push({ pythonLine: PL('return'), phase: 'done', activeLine: CL('return false;'), at: -1, rows: snapshot(), message: result ? 'A contradiction exists.' : 'Every equation agrees with the others.', contradiction: result })
  return { input: { equations, values }, result, frames }
}

export const code = `function checkContradictions(equations, values) {
  const parent = new Map();
  const weight = new Map();
  const find = x => {
    if (!parent.has(x)) {
      parent.set(x, x);
      weight.set(x, 1);
    }
    if (parent.get(x) === x) return [x, 1];
    const [root, r] = find(parent.get(x));
    weight.set(x, weight.get(x) * r);
    parent.set(x, root);
    return [root, weight.get(x)];
  };
  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i];
    const v = values[i];
    const [ra, ratioA] = find(a);
    const [rb, ratioB] = find(b);
    if (ra === rb) {
      const implied = ratioA / ratioB;
      if (Math.abs(implied - v) >= 1e-5) return true;
    } else {
      parent.set(ra, rb);
      weight.set(ra, v * ratioB / ratioA);
    }
  }
  return false;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def check_contradictions(equations, values):
    parent = {}
    weight = {}

    def find(x):
        if x not in parent:
            parent[x] = x
            weight[x] = 1.0
        if parent[x] == x:
            return x, 1.0
        root, r = find(parent[x])
        weight[x] = weight[x] * r
        parent[x] = root
        return root, weight[x]

    for (a, b), v in zip(equations, values):
        ra, rat_a = find(a)
        rb, rat_b = find(b)
        if ra == rb:
            if abs(rat_a / rat_b - v) >= 1e-5:
                return True
        else:
            parent[ra] = rb
            weight[ra] = v * rat_b / rat_a
    return False
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
