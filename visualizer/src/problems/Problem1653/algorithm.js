export const phases = [
  { id: 'start', label: 'Start scan', description: 'Start with no deletions and no earlier b characters.' },
  { id: 'inspect', label: 'Read character', description: 'Read the next character and see whether it is a or b.' },
  { id: 'update', label: 'Choose cheapest', description: 'A b only raises the count; an a is deleted or all earlier b characters are deleted, whichever is cheaper.' },
  { id: 'done', label: 'Minimum', description: 'Return the cheapest number of deletions for the whole string.' },
]

export const code = `min deletions to balance (s):
  deleted = 0
  b_count = 0
  for each character ch in s:
    if ch is b:
      b_count = b_count + 1
    else:
      deleted = min(deleted + 1, b_count)
  return deleted`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_deletions(s):
    deleted = 0
    b_count = 0
    for ch in s:
        if ch == 'b':
            b_count += 1
        else:
            deleted = min(deleted + 1, b_count)
    return deleted
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "aababb"}.')
  const { s } = input
  if (typeof s !== 'string' || !/^[ab]{1,60}$/.test(s)) throw new Error('s is 1 to 60 characters, each a or b.')
  return { s }
}

export function buildTrace({ s }) {
  let deleted = 0
  let bCount = 0
  const frames = []
  const snap = (index, char, choice) => ({ s, index, char, bCount, deleted, choice })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })

  push('start', 'deleted = 0', 'deleted = 0', 'No deletions yet and no b characters seen.', snap(null, null, null))
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    push('inspect', 'for each character', 'for ch in s', `Read ${ch} at position ${i}.`, snap(i, ch, null))
    if (ch === 'b') {
      bCount += 1
      push('update', 'b_count = b_count + 1', "if ch == 'b'", `b adds to the count of earlier b characters (now ${bCount}); no deletion is needed.`, snap(i, ch, 'keep b'))
    } else {
      const deleteThis = deleted + 1
      const deleteEarlierB = bCount
      deleted = Math.min(deleteThis, deleteEarlierB)
      const choice = deleteThis <= deleteEarlierB ? 'delete this a' : 'delete earlier b characters'
      push('update', 'deleted = min(', 'deleted = min', `Deleting this a costs ${deleteThis}; deleting the ${deleteEarlierB} earlier b characters costs ${deleteEarlierB}. Keep ${deleted}.`, snap(i, ch, choice))
    }
  }
  push('done', 'return deleted', 'return deleted', `Minimum deletions: ${deleted}.`, snap(null, null, null))
  return { input: { s }, result: deleted, frames }
}
