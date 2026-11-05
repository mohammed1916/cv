export function parseInput(text) {
  const strs = JSON.parse(text)
  if (!Array.isArray(strs) || strs.length < 1 || strs.length > 12 || strs.some(s => typeof s !== 'string' || !/^[a-z]{1,6}$/.test(s))) throw new Error('Enter 1–12 lowercase strings of 1–6 letters.')
  const len = strs[0].length
  if (strs.some(s => s.length !== len)) throw new Error('All strings have the same length.')
  const sorted = s => [...s].sort().join('')
  if (strs.some(s => sorted(s) !== sorted(strs[0]))) throw new Error('All strings are anagrams of each other.')
  return strs
}

// Two strings are similar when they are equal or differ at exactly two positions that swap.
export function similar(a, b) {
  if (a === b) return true
  const diff = []
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { diff.push(i); if (diff.length > 2) return false }
  return diff.length === 2 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]]
}

const JS_LINES = [
  'function numSimilarGroups(strs) {',
  '  const parent = strs.map((_, i) => i) // each string starts in its own group',
  '  const find = i => { while (parent[i] !== i) i = parent[i]; return i }',
  '  let groups = strs.length',
  '  for (let i = 0; i < strs.length; i++) {',
  '    for (let j = i + 1; j < strs.length; j++) {',
  '      if (!similar(strs[i], strs[j])) continue',
  '      const a = find(i), b = find(j)',
  '      if (a !== b) { parent[a] = b; groups-- } // merging two groups removes one',
  '    }',
  '  }',
  '  return groups',
  '}',
]
const PY_LINES = [
  'def num_similar_groups(strs):',
  '    parent = list(range(len(strs)))',
  '    def find(i):',
  '        while parent[i] != i:',
  '            i = parent[i]',
  '        return i',
  '    groups = len(strs)',
  '    for i in range(len(strs)):',
  '        for j in range(i + 1, len(strs)):',
  '            if not similar(strs[i], strs[j]):',
  '                continue',
  '            a, b = find(i), find(j)',
  '            if a != b:',
  '                parent[a] = b',
  '                groups -= 1',
  '    return groups',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Union-find on the strings. Every similar pair merges two groups; the answer is the number of groups left.
export function buildTrace(strs) {
  const n = strs.length
  const parent = strs.map((_, i) => i)
  const size = strs.map(() => 1)
  const find = i => { while (parent[i] !== i) i = parent[i]; return i }
  let groups = n
  const snapshot = () => ({ parent: [...parent], size: [...size] })
  const frames = [{ phase: 'start', pair: null, groups, ...snapshot(), activeLine: L('const parent'), pythonLine: P('parent = list'), message: `${n} strings start in separate groups.` }]
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const sim = similar(strs[i], strs[j])
    if (!sim) continue
    const a = find(i), b = find(j)
    if (a !== b) {
      if (size[a] < size[b]) { parent[a] = b; size[b] += size[a] } else { parent[b] = a; size[a] += size[b] }
      groups--
      frames.push({ phase: 'merge', pair: [i, j], groups, ...snapshot(), activeLine: L('merging two groups'), pythonLine: P('groups -= 1'), message: `"${strs[i]}" and "${strs[j]}" are similar: their groups merge, leaving ${groups}.` })
    } else {
      frames.push({ phase: 'same', pair: [i, j], groups, ...snapshot(), activeLine: L('if (a !== b)'), pythonLine: P('if a != b'), message: `"${strs[i]}" and "${strs[j]}" are similar but already in one group.` })
    }
  }
  frames.push({ phase: 'done', pair: null, groups, ...snapshot(), result: groups, activeLine: L('return groups'), pythonLine: P('return groups'), message: `${groups} group${groups === 1 ? '' : 's'} of similar strings.` })
  return { input: strs, result: groups, labels: strs, frames }
}
