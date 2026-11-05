export const phases = [
  { id: 'start', label: 'Sort', description: 'Sort by attack from high to low; within equal attack the order does not matter for the comparison.' },
  { id: 'group', label: 'Attack group', description: 'Every character in a group is compared with the best defense of characters with strictly higher attack.' },
  { id: 'update', label: 'Update best defense', description: 'After the group, its highest defense becomes part of the comparison for lower attacks.' },
  { id: 'done', label: 'Result', description: 'Return the number of weak characters.' },
]

export const code = `function countWeakCharacters(properties) {
  const sorted = [...properties].sort((a, b) => b[0] - a[0] || a[1] - b[1])
  let weak = 0
  let maxDefense = 0
  let i = 0
  while (i < sorted.length) {
    let j = i
    let groupMax = maxDefense
    while (j < sorted.length && sorted[j][0] === sorted[i][0]) {
      if (sorted[j][1] < maxDefense) weak++
      groupMax = Math.max(groupMax, sorted[j][1])
      j++
    }
    maxDefense = groupMax
    i = j
  }
  return weak
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_weak_characters(properties):
    ordered = sorted(properties, key=lambda p: (-p[0], p[1]))
    weak = 0
    max_defense = 0
    i = 0
    while i < len(ordered):
        j = i
        group_max = max_defense
        while j < len(ordered) and ordered[j][0] == ordered[i][0]:
            if ordered[j][1] < max_defense:
                weak += 1
            group_max = max(group_max, ordered[j][1])
            j += 1
        max_defense = group_max
        i = j
    return weak
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let props
  try { props = JSON.parse(text) } catch { throw new Error('Use a JSON array of [attack, defense] pairs.') }
  if (!Array.isArray(props) || props.length < 2 || props.length > 20) throw new Error('Give 2 to 20 characters here.')
  if (!props.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 1 && v <= 100000))) {
    throw new Error('Each character is [attack, defense] with whole numbers from 1 to 100000.')
  }
  return props
}

export function buildTrace(properties) {
  const frames = []
  const sorted = [...properties].sort((a, b) => b[0] - a[0] || a[1] - b[1])
  let weak = 0
  let maxDefense = 0
  const weakSet = []
  const add = (phase, c, p, message, index, row) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { sorted, index, row, maxDefense, weak, weakSet: weakSet.slice() },
  })
  add('start', 'const sorted', 'ordered = sorted', 'Characters are sorted by attack from high to low.', -1, -1)
  let i = 0
  while (i < sorted.length) {
    let j = i
    let groupMax = maxDefense
    while (j < sorted.length && sorted[j][0] === sorted[i][0]) {
      const isWeak = sorted[j][1] < maxDefense
      if (isWeak) { weak++; weakSet.push(j) }
      add('group', 'if (sorted[j][1] < maxDefense)', 'if ordered[j][1] < max_defense', `Attack ${sorted[j][0]}, defense ${sorted[j][1]}: ${isWeak ? `weak, since ${maxDefense} is higher` : 'not beaten'}.`, j, j)
      groupMax = Math.max(groupMax, sorted[j][1])
      j++
    }
    maxDefense = groupMax
    add('update', 'maxDefense = groupMax', 'max_defense = group_max', `Best defense among attacks of ${sorted[i][0]} and above is now ${maxDefense}.`, j - 1, -1)
    i = j
  }
  add('done', 'return weak', 'return weak', `${weak} weak character(s).`, sorted.length - 1, -1)
  return { input: properties, result: weak, frames }
}
