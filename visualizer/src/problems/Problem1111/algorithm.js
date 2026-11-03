export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with depth zero and no assigned characters.' },
  { id: 'inspect', label: 'Walk', description: 'Read each bracket, track the depth, and give it the group that matches the depth parity.' },
  { id: 'done', label: 'Result', description: 'Return one group label for every character.' },
]

export const inputLabel = 'A balanced string of ( and ) characters, 2 to 100 long, such as ((())())()'
export const complexity = 'O(n) time and O(n) output space: one pass tracks the depth and assigns each bracket a group.'
export const examples = [{ label: 'Sample', input: '((())())()' }]

export const code = [
  'function split_groups(s):',
  '    depth = 0',
  '    groups = []',
  '    for ch in s:',
  '        if ch is "(":',
  '            depth = depth + 1',
  '            append depth mod 2',
  '        else:',
  '            append depth mod 2',
  '            depth = depth - 1',
  '    return groups',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def split_groups(s):
    depth = 0
    groups = []
    for ch in s:
        if ch == '(':
            depth += 1
            groups.append(depth % 2)
        else:
            groups.append(depth % 2)
            depth -= 1
    return groups`

export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export function parseInput(text) {
  const s = text.trim()
  if (s.length < 2 || s.length > 100) throw new Error('Use a string of 2 to 100 brackets.')
  if (!/^[()]+$/.test(s)) throw new Error('Use only ( and ) characters.')
  let depth = 0
  for (const ch of s) {
    depth += ch === '(' ? 1 : -1
    if (depth < 0) throw new Error('A closing bracket appears before its opening bracket.')
  }
  if (depth !== 0) throw new Error('Every opening bracket needs a closing bracket.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const groups = []
  let depth = 0
  const snap = (current, extra = {}) => ({ chars: s, groups: [...groups], depth, current, ...extra })

  frames.push({
    phase: 'start', activeLine: 2,
    message: `The string has ${s.length} brackets. Start at depth 0; bracket groups are decided one character at a time.`,
    snapshot: snap(-1),
  })

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') {
      depth += 1
      groups.push(depth % 2)
      frames.push({
        phase: 'inspect', activeLine: 7,
        message: `Character ${i + 1} is an opening bracket. Depth rises to ${depth}, so it joins group ${depth % 2}.`,
        snapshot: snap(i),
      })
    } else {
      groups.push(depth % 2)
      frames.push({
        phase: 'inspect', activeLine: 9,
        message: `Character ${i + 1} is a closing bracket that closes depth ${depth}, so it joins group ${depth % 2}. Depth then falls to ${depth - 1}.`,
        snapshot: snap(i),
      })
      depth -= 1
    }
  }

  frames.push({
    phase: 'done', activeLine: 11,
    message: `Return the group labels: ${groups.join(' ')}.`,
    snapshot: snap(s.length, { complete: true }),
  })
  return { input: s, result: groups, frames }
}
