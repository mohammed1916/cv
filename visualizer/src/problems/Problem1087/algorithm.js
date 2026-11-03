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
    emit('parse', braced ? 'keep each group' : 'split s into groups', braced ? 'options = sorted' : 'groups.append([s[i]])',
      `Read ${group.display}: ${group.options.join(', ')}.`, { groups: groups.slice(0, k + 1) })
  })

  emit('start', 'walk(0, "")', 'walk(0, ', `Begin at group 1 with an empty prefix; ${groups.length} group(s) to set.`)

  function walk(index, prefix) {
    if (index === groups.length) {
      results.push(prefix)
      emit('emit', 'walk(index, prefix)', 'if index ==', `Every group is set, so ${prefix} joins the results.`,
        { depth: index, prefix, emitted: results.length - 1 })
      return
    }
    emit('enter', 'walk(index, prefix)', 'def walk', `Choose from ${groups[index].display} after prefix "${prefix}".`, { depth: index, prefix })
    for (const option of groups[index].options) {
      emit('try', 'for each letter c', 'walk(index + 1', `Take ${option} from ${groups[index].display}.`, { depth: index, prefix, option })
      walk(index + 1, prefix + option)
    }
  }

  walk(0, '')

  const sorted = [...results].sort()
  emit('done', 'return results sorted', 'return sorted(results)', `${sorted.length} expansion(s) in lexicographic order.`, { results: sorted })
  return { input: { s }, result: sorted, answer: sorted, frames }
}

export const code = `expand the brace string s
split s into groups, one per letter or brace pair
keep each group's distinct letters in sorted order
results = []
walk(0, "")
walk(index, prefix)
  if index equals the group count then add prefix to results and return
  for each letter c in group index, in order
    walk(index plus 1, prefix plus c)
return results sorted`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
if (L('keep each group') < 1 || L('walk(0, "")') < 1) throw new Error('Pseudocode lookup is missing text.')

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
