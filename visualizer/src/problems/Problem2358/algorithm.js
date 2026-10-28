export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with grades.')
  const { grades } = data
  if (!Array.isArray(grades) || grades.length < 1 || grades.length > 12) throw new Error('grades must have 1 to 12 entries.')
  if (grades.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Grades are integers from 1 to 100.')
  return { grades }
}

export function buildTrace(input) {
  let left = input.grades.length
  let size = 1
  let groups = 0
  const frames = [{ phase: 'start', activeLine: L('set left to the number of students'), left, size, groups, message: `${left} students. The first group needs at least one student.` }]
  while (left >= size) {
    left -= size
    groups += 1
    frames.push({ phase: 'group', activeLine: L('take size students'), left, size, groups, message: `Group ${groups} takes ${size} student${size === 1 ? '' : 's'}; ${left} left.` })
    size += 1
  }
  frames.push({ phase: 'done', activeLine: L('return groups'), left, size, groups, message: `Maximum groups: ${groups}.` })
  return { input, result: groups, frames }
}

export const code = `maximum number of groups:
  set left to the number of students
  set size to one and groups to zero
  while left is at least size
    take size students into a new group and subtract size from left
    increase groups by one
    increase size by one
  return groups`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_groups(grades):
    left = len(grades)
    size = 1
    groups = 0
    while left >= size:
        left -= size
        groups += 1
        size += 1
    return groups
`
