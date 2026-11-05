export const phases = [
  { id: 'start', label: 'Start', description: 'Sort the stones from heaviest to lightest.' },
  { id: 'pick', label: 'Pick two', description: 'Take the two heaviest stones off the top of the list.' },
  { id: 'smash', label: 'Smash', description: 'Equal stones vanish; otherwise the difference goes back into the sorted list.' },
  { id: 'done', label: 'Answer', description: 'Report the one stone left, or 0 if none is left.' },
]

export const code = `function lastStoneWeight(stones) {
  const pile = [...stones].sort((a, b) => b - a)
  while (pile.length > 1) {
    const x = pile.shift()
    const y = pile.shift()
    if (x !== y) {
      pile.push(x - y)
      pile.sort((a, b) => b - a)
    }
  }
  return pile.length ? pile[0] : 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))


export const pythonLineMap = {}

export const python = `def last_stone_weight(stones):
    stones = sorted(stones, reverse=True)
    while len(stones) > 1:
        x, y = stones.pop(0), stones.pop(0)
        if x != y:
            stones.append(x - y)
            stones.sort(reverse=True)
    return stones[0] if stones else 0
`

export function parseInput(text) {
  let arr
  try { arr = JSON.parse(text) } catch { throw new Error('Use a JSON array of stone weights, such as [6,2,9,4].') }
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('Give between 1 and 12 stones.')
  if (!arr.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each weight is an integer from 1 to 1000.')
  return arr.slice()
}

export function buildTrace(input) {
  const stones = [...input].sort((a, b) => b - a)
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 2, message: 'Sort the stones from heaviest to lightest.', snapshot: { stones: [...stones], picked: null } }]
  while (stones.length > 1) {
    const x = stones.shift()
    const y = stones.shift()
    frames.push({ phase: 'pick', activeLine: 5, pythonLine: 4, message: `Take ${x} and ${y} off the top of the list.`, snapshot: { stones: [...stones], picked: [x, y] } })
    if (x !== y) {
      stones.push(x - y)
      stones.sort((a, b) => b - a)
    }
    const message = x === y ? `${x} equals ${y}, so both stones vanish.` : `${x} - ${y} = ${x - y} goes back into the sorted list.`
    frames.push({ phase: 'smash', activeLine: 6, pythonLine: 6, message, snapshot: { stones: [...stones], picked: [x, y] } })
  }
  const result = stones.length ? stones[0] : 0
  frames.push({ phase: 'done', activeLine: 11, pythonLine: 8, message: result ? `One stone remains with weight ${result}.` : 'No stone remains, so the answer is 0.', snapshot: { stones: [...stones], picked: null } })
  return { input, result, frames }
}
