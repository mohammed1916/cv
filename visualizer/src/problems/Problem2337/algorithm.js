export function parseInput(text) {
  const input = JSON.parse(text)
  const { start, target } = input ?? {}
  if (typeof start !== 'string' || typeof target !== 'string') throw new Error('Use start and target strings.')
  if (start.length < 1 || start.length > 12) throw new Error('Strings need 1 to 12 characters.')
  if (start.length !== target.length) throw new Error('start and target must have the same length.')
  if (!/^[LR_]+$/.test(start) || !/^[LR_]+$/.test(target)) throw new Error('Use only L, R and _ (blank).')
  return { start, target }
}

export function buildTrace({ start, target }) {
  const n = start.length
  let i = 0
  let j = 0
  const frames = [{ phase: 'start', activeLine: L('can start become target by sliding pieces'), i, j, message: 'Walk both strings in order, ignoring blanks, and pair up the pieces.' }]
  const skip = () => {
    while (i < n && start[i] === '_') i++
    while (j < n && target[j] === '_') j++
  }
  for (;;) {
    skip()
    if (i === n || j === n) {
      frames.push({ phase: 'stop', activeLine: L('stop the loop when either pointer'), i, j, message: 'One string has no pieces left.' })
      break
    }
    if (start[i] !== target[j]) {
      frames.push({ phase: 'fail', activeLine: L('if the pieces under the pointers differ'), i, j, message: `Piece ${start[i]} cannot become ${target[j]}, so the answer is false.` })
      return { input: { start, target }, result: false, frames }
    }
    if ((start[i] === 'L' && i < j) || (start[i] === 'R' && i > j)) {
      frames.push({ phase: 'fail', activeLine: L('if a left piece would have to move right'), i, j, message: `That ${start[i]} would have to move the wrong way, so the answer is false.` })
      return { input: { start, target }, result: false, frames }
    }
    frames.push({ phase: 'match', activeLine: L('move both pointers forward'), i, j, message: `Piece ${start[i]} at ${i} can slide to ${j}.` })
    i++
    j++
  }
  const result = i === n && j === n
  frames.push({ phase: 'done', activeLine: L('return true only if'), i, j, message: result ? 'Every piece lands in place, so the answer is true.' : 'Pieces are left over on one side, so the answer is false.' })
  return { input: { start, target }, result, frames }
}

export const code = `can start become target by sliding pieces
  set pointer i in start and pointer j in target to the first position
  keep going
    skip blanks in start and in target
    stop the loop when either pointer has passed the end
    if the pieces under the pointers differ then return false
    if a left piece would have to move right, or a right piece would have to move left then return false
    move both pointers forward
  return true only if both pointers have passed the end`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_transform(start, target):
    n = len(start)
    i = 0
    j = 0
    while True:
        while i < n and start[i] == '_':
            i += 1
        while j < n and target[j] == '_':
            j += 1
        if i == n or j == n:
            break
        if start[i] != target[j]:
            return False
        if start[i] == 'L' and i < j:
            return False
        if start[i] == 'R' and i > j:
            return False
        i += 1
        j += 1
    return i == n and j == n
`
