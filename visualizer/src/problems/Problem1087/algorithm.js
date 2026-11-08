// Brace Expansion: each brace group is one choice point; a walk picks one letter per group.
// Visualization limits (not official bounds): at most 30 characters and 64 expansions.
const MAX_LENGTH = 30
const MAX_EXPANSIONS = 64

export function parseInput(text) {
  const s = String(text ?? '').trim()
  if (s.length < 1 || s.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} characters for this visualization.`)
  if (!/^[a-z{},]+$/.test(s)) throw new Error('Use only lowercase letters, braces and commas.')
  const groups = readGroups(s)
  const count = groups.reduce((product, group) => product * group.options.length, 1)
  if (count > MAX_EXPANSIONS) throw new Error(`Keep the expansion count at ${MAX_EXPANSIONS} or fewer for this visualization.`)
  return { s }
}

// Splits the string into groups. Repeated alternatives inside one brace pair collapse to one option.
function readGroups(s) {
  const groups = []
  let i = 0
  while (i < s.length) {
    if (s[i] === '{') {
      const j = s.indexOf('}', i)
      if (j < 0) throw new Error('Every { needs a matching }.')
      const inner = s.slice(i + 1, j)
      const parts = inner.split(',')
      if (parts.some(part => !/^[a-z]$/.test(part))) throw new Error('Each brace group holds comma-separated single letters, with no nesting.')
      groups.push({ display: `{${inner}}`, options: [...new Set(parts)].sort() })
      i = j + 1
    } else if (/^[a-z]$/.test(s[i])) {
      groups.push({ display: s[i], options: [s[i]] })
      i++
    } else {
      throw new Error('Commas and closing braces may only appear inside a group.')
    }
  }
  return groups
}

export function buildTrace({ s }) {
  const groups = readGroups(s)
  const frames = []
  const results = []

  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase,
    activeLine: L(activeLine),
    pythonLine: P(pythonLine),
    message,
    groups,
    depth: -1,
    prefix: '',
    option: null,
    results: results.slice(),
    emitted: -1,
    ...extra,
  })

  groups.forEach((group, k) => {
    const braced = group.display.length > 1
    emit('parse', braced ? 'const options' : 'groups.push([s[i]])', braced ? 'options = sorted' : 'groups.append([s[i]])',
      `Read ${group.display}: ${group.options.join(', ')}.`, { groups: groups.slice(0, k + 1) })
  })

  emit('start', 'walk(0, \'\')', 'walk(0, ', `Begin at group 1 with an empty prefix; ${groups.length} group(s) to set.`)

  function walk(index, prefix) {
    if (index === groups.length) {
      results.push(prefix)
      emit('emit', 'if (index === groups.length)', 'if index ==', `Every group is set, so ${prefix} joins the results.`,
        { depth: index, prefix, emitted: results.length - 1 })
      return
    }
    emit('enter', 'walk = (index, prefix)', 'def walk', `Choose from ${groups[index].display} after prefix "${prefix}".`, { depth: index, prefix })
    for (const option of groups[index].options) {
      emit('try', 'for (const c of groups[index])', 'walk(index + 1', `Take ${option} from ${groups[index].display}.`, { depth: index, prefix, option })
      walk(index + 1, prefix + option)
    }
  }

  walk(0, '')

  const sorted = [...results].sort()
  emit('done', 'return results.sort()', 'return sorted(results)', `${sorted.length} expansion(s) in lexicographic order.`, { results: sorted })
  return { input: { s }, result: sorted, answer: sorted, frames }
}

export const code = `function braceExpansion(s) {
  const groups = []
  let i = 0
  while (i < s.length) {
    if (s[i] === '{') {
      const j = s.indexOf('}', i)
      const options = [...new Set(s.slice(i + 1, j).split(','))].sort()
      groups.push(options)
      i = j + 1
    } else {
      groups.push([s[i]])
      i++
    }
  }
  const results = []
  const walk = (index, prefix) => {
    if (index === groups.length) {
      results.push(prefix)
      return
    }
    for (const c of groups[index]) walk(index + 1, prefix + c)
  }
  walk(0, '')
  return results.sort()
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
if (L('const options') < 1 || L('walk(0, \'\')') < 1) throw new Error('Code lookup is missing text.')

export const python = `def brace_expansion(s):
    groups = []
    i = 0
    while i < len(s):
        if s[i] == '{':
            j = s.index('}', i)
            options = sorted(set(s[i + 1:j].split(',')))
            groups.append(options)
            i = j + 1
        else:
            groups.append([s[i]])
            i += 1
    results = []
    def walk(index, prefix):
        if index == len(groups):
            results.append(prefix)
            return
        for c in groups[index]:
            walk(index + 1, prefix + c)
    walk(0, '')
    return sorted(results)
`
const PY = python.trim().split('\n')
const P = s => {
  const line = PY.findIndex(text => text.includes(s)) + 1
  if (line < 1) throw new Error(`Python line missing: ${s}`)
  return line
}

export const inputLabel = 'Brace string (e.g. p{q,r}{s,t}z)'
export const complexity = 'O(k * n) time for k expansions of length n, plus sorting the k results. The visualization caps the input at 30 characters and 64 expansions; these are visualization limits, not official bounds.'
export const examples = [
  { label: 'Two groups', input: 'p{q,r}{s,t}z' },
  { label: 'Sorted groups', input: '{x,w}yz{b,a}' },
  { label: 'No braces', input: 'kite' },
  { label: 'Single letter', input: 'a' },
  { label: 'Duplicate options collapse', input: '{a,a}b' },
  { label: '64 expansions at the limit', input: '{a,b}{c,d}{e,f}{g,h}{i,j}{k,l}' },
  { label: 'Long run: 24 expansions', input: '{m,n,o,p}{q,r,s}{t,u}z' },
]

export const phases = [
  { id: "start", label: "Start", description: "Begin the walk from the first group." },
  { id: "parse", label: "Groups", description: "Read each group and sort its letters." },
  { id: "enter", label: "Choose", description: "Pick the letters for the next group." },
  { id: "try", label: "Try", description: "Extend the prefix with one letter." },
  { id: "emit", label: "Emit", description: "A full prefix is one expansion." },
  { id: "done", label: "Result", description: "Return the sorted results." },
]
