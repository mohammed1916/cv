export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, goal } = data ?? {}
  const ok = x => typeof x === 'string' && x.length >= 1 && x.length <= 200 && /^[a-z]+$/.test(x)
  if (!ok(s) || !ok(goal)) throw new Error('s and goal are 1–200 lowercase letters.')
  return { s, goal }
}

const JS_LINES = [
  'function buddyStrings(s, goal) {',
  '  if (s.length !== goal.length) return false // swapping keeps the length',
  '  if (s === goal) { // identical strings need a repeated letter to swap with itself',
  '    return new Set(s).size < s.length',
  '  }',
  '  const diff = [] // positions where the strings disagree',
  '  for (let i = 0; i < s.length; i++) {',
  '    if (s[i] !== goal[i]) diff.push(i)',
  '    if (diff.length > 2) return false',
  '  }',
  '  return diff.length === 2 && s[diff[0]] === goal[diff[1]] && s[diff[1]] === goal[diff[0]] // one swap fixes both',
  '}',
]
const PY_LINES = [
  'def buddy_strings(s, goal):',
  '    if len(s) != len(goal):',
  '        return False',
  '    if s == goal:',
  '        return len(set(s)) < len(s)',
  '    diff = []',
  '    for i in range(len(s)):',
  '        if s[i] != goal[i]:',
  '            diff.append(i)',
  '        if len(diff) > 2:',
  '            return False',
  '    return len(diff) == 2 and s[diff[0]] == goal[diff[1]] and s[diff[1]] == goal[diff[0]]',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Either the strings are equal and some letter repeats, or they differ at exactly two positions that cross-match.
export function buildTrace({ s, goal }) {
  if (s.length !== goal.length) {
    return { input: { s, goal }, result: false, diff: [], frames: [{ phase: 'done', diff: [], result: false, activeLine: L('if (s.length !== goal.length)'), pythonLine: P('return False'), message: 'Different lengths can never match after one swap.' }] }
  }
  if (s === goal) {
    const repeated = new Set(s).size < s.length
    return { input: { s, goal }, result: repeated, diff: [], frames: [{ phase: 'equal', diff: [], result: repeated, activeLine: L('return new Set(s).size'), pythonLine: P('return len(set(s))'), message: repeated ? 'The strings are equal and a letter repeats, so swapping two equal letters keeps them equal.' : 'The strings are equal but every letter is unique, so any swap changes them.' }] }
  }
  const diff = []
  const frames = [{ phase: 'start', diff: [], activeLine: L('const diff = []'), pythonLine: P('diff = []'), message: 'Find the positions where the strings disagree.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== goal[i]) diff.push(i)
    frames.push({ phase: s[i] !== goal[i] ? 'differ' : 'same', i, diff: [...diff], activeLine: L('if (s[i] !== goal[i])'), pythonLine: P('if s[i] != goal[i]'), message: s[i] !== goal[i] ? `Position ${i}: '${s[i]}' vs '${goal[i]}' differs.` : `Position ${i} matches.` })
    if (diff.length > 2) {
      frames.push({ phase: 'done', diff: [...diff], result: false, activeLine: L('if (diff.length > 2)'), pythonLine: P('return False'), message: 'More than two positions differ, so one swap cannot fix it.' })
      return { input: { s, goal }, result: false, diff, frames }
    }
  }
  const result = diff.length === 2 && s[diff[0]] === goal[diff[1]] && s[diff[1]] === goal[diff[0]]
  frames.push({ phase: 'done', diff: [...diff], result, activeLine: L('return diff.length === 2'), pythonLine: P('return len(diff) == 2'), message: result ? `Swapping positions ${diff[0]} and ${diff[1]} makes the strings equal.` : 'The two differing positions do not cross-match.' })
  return { input: { s, goal }, result, diff, frames }
}
