export const phases = [
  { id: 'start', label: 'Start', description: 'Nothing is reserved yet, and no suffix counters exist.' },
  { id: 'check', label: 'Check name', description: 'Ask whether the requested name is already reserved.' },
  { id: 'probe', label: 'Probe suffix', description: 'Try the next numeric suffix while the candidate is taken.' },
  { id: 'assign', label: 'Assign', description: 'Reserve the final name and remember where its suffix search resumes.' },
  { id: 'done', label: 'Complete', description: 'Return one final name for every request, in order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"names": ["doc", "doc"]}.')
  const { names } = input
  if (!Array.isArray(names) || names.length < 1 || names.length > 20 || !names.every(n => typeof n === 'string' && /^[a-z]{1,6}$/.test(n))) throw new Error('names is a list of 1 to 20 lowercase words of 1 to 6 letters.')
  return { names }
}

export function buildTrace({ names }) {
  const used = new Set()
  const nextSuffix = new Map()
  const result = []
  const at = n => ({ activeLine: n, pythonLine: n })
  const snap = (index, current, candidate, k) => ({ index, current, candidate, k, used: [...used], result: [...result], nextSuffix: [...nextSuffix] })
  const frames = [{ phase: 'start', ...at(2), snapshot: snap(null, null, null, null), message: 'Nothing is reserved yet. Each request is answered in order.' }]
  names.forEach((name, index) => {
    if (!used.has(name)) {
      frames.push({ phase: 'check', ...at(6), snapshot: snap(index, name, name, null), message: `"${name}" is free, so it keeps its name.` })
      used.add(name)
      result.push(name)
      frames.push({ phase: 'assign', ...at(7), snapshot: snap(index, name, name, null), message: `Reserve "${name}" and return it unchanged.` })
      return
    }
    frames.push({ phase: 'check', ...at(9), snapshot: snap(index, name, null, null), message: `"${name}" is already reserved, so it needs a suffix. Start from its saved counter.` })
    let k = nextSuffix.get(name) ?? 1
    let candidate = `${name}(${k})`
    while (used.has(candidate)) {
      frames.push({ phase: 'probe', ...at(10), snapshot: snap(index, name, candidate, k), message: `"${candidate}" is taken, so try suffix ${k + 1}.` })
      k++
      candidate = `${name}(${k})`
    }
    frames.push({ phase: 'probe', ...at(10), snapshot: snap(index, name, candidate, k), message: `"${candidate}" is free.` })
    used.add(candidate)
    result.push(candidate)
    nextSuffix.set(name, k + 1)
    frames.push({ phase: 'assign', ...at(13), snapshot: snap(index, name, candidate, k), message: `Reserve "${candidate}". Later "${name}" requests resume at suffix ${k + 1}.` })
  })
  frames.push({ phase: 'done', ...at(15), snapshot: snap(null, null, null, null), message: `Final names: ${result.join(', ')}.` })
  return { input: { names }, result, frames }
}


const pythonLines = [
  'def make_unique(names):',
  '    used = set()',
  '    next_suffix = {}',
  '    result = []',
  '    for name in names:',
  '        if name not in used:',
  '            used.add(name); result.append(name)',
  '            continue',
  '        k = next_suffix.get(name, 1)',
  '        while f"{name}({k})" in used:',
  '            k += 1',
  '        candidate = f"{name}({k})"',
  '        used.add(candidate); result.append(candidate)',
  '        next_suffix[name] = k + 1',
  '    return result',
]

export const code = [
  "function makeUnique(names) {",
  "  const used = new Set()",
  "  const nextSuffix = new Map()",
  "  const result = []",
  "  for (const name of names) {",
  "    if (!used.has(name)) {",
  "      used.add(name); result.push(name); continue }",
  "    // the name is taken: resume its suffix search",
  "    let k = nextSuffix.get(name) ?? 1",
  "    while (used.has(`${name}(${k})`)) {",
  "      k += 1",
  "    }",
  "    const candidate = `${name}(${k})`; used.add(candidate); result.push(candidate)",
  "    nextSuffix.set(name, k + 1) }",
  "  return result }",
].map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
