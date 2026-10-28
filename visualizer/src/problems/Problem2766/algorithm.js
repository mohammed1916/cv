export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.nums) || !Array.isArray(data.moveFrom) || !Array.isArray(data.moveTo)) throw new Error('Use {"nums": [...], "moveFrom": [...], "moveTo": [...]}.')
  const { nums, moveFrom, moveTo } = data
  if (nums.length < 1 || nums.length > 10) throw new Error('Use 1 to 10 starting marbles.')
  if (moveFrom.length !== moveTo.length || moveFrom.length > 10) throw new Error('moveFrom and moveTo must have the same length, at most 10.')
  const isPos = v => Number.isInteger(v) && v >= 1 && v <= 20
  if (nums.some(v => !isPos(v)) || moveFrom.some(v => !isPos(v)) || moveTo.some(v => !isPos(v))) throw new Error('Positions are integers from 1 to 20.')
  const occupied = new Set(nums)
  moveFrom.forEach((from, i) => {
    if (!occupied.has(from)) throw new Error(`Move ${i + 1}: there is no marble at ${from} to move.`)
    occupied.delete(from)
    occupied.add(moveTo[i])
  })
  return { nums, moveFrom, moveTo }
}

export function buildTrace(input) {
  const { nums, moveFrom, moveTo } = input
  const occupied = new Set(nums)
  const setMap = () => [{ name: 'occupied', keyLabel: 'position', valueLabel: '', isSet: true, entries: [...occupied].sort((a, b) => a - b).map(p => [p]) }]
  const frames = [{ phase: 'start', activeLine: L('occupied = set'), index: -1, maps: setMap(), ops: [], result: null, message: `Start with positions ${[...occupied].sort((a, b) => a - b).join(', ')}.` }]
  moveFrom.forEach((from, i) => {
    const to = moveTo[i]
    occupied.delete(from)
    occupied.add(to)
    frames.push({ phase: 'move', activeLine: L('remove moveFrom'), index: i, maps: setMap(),
      ops: [{ map: 'occupied', type: 'delete', key: from, existed: true, before: from }, { map: 'occupied', type: 'insert', key: to, value: to }],
      result: null, message: `Move ${i + 1}: every marble at ${from} goes to ${to}.` })
  })
  const result = [...occupied].sort((a, b) => a - b)
  frames.push({ phase: 'done', activeLine: L('return the occupied'), index: -1, maps: setMap(), ops: [], result, message: `Occupied positions: ${result.join(', ')}.` })
  return { input, result, frames }
}

export const code = `relocate marbles and return the occupied positions
occupied = set of starting positions
for each move i
  remove moveFrom[i] from occupied
  add moveTo[i] to occupied
return the occupied positions, sorted`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def relocate_marbles(nums, moveFrom, moveTo):
    occupied = set(nums)
    for src, dst in zip(moveFrom, moveTo):
        occupied.discard(src)
        occupied.add(dst)
    return sorted(occupied)
`
