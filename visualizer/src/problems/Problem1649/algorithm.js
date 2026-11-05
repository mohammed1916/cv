export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.instructions)) throw new Error('Use {"instructions": [...]}.')
  const arr = obj.instructions
  if (arr.length < 1 || arr.length > 30) throw new Error('Use 1 to 30 instructions.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each instruction is an integer from 1 to 10.')
  return { instructions: arr }
}

export function buildTrace(input) {
  const MOD = 1000000007
  const values = input.instructions
  let cost = 0
  const inserted = []
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('let cost = 0'), value: null, less: 0, greater: 0, sorted: [], cost: 0, message: 'Insert each value into a growing sorted array, paying the cheaper side each time.' }]
  values.forEach(v => {
    let less = 0
    let greater = 0
    for (const x of inserted) {
      if (x < v) less++
      else if (x > v) greater++
    }
    frames.push({ phase: 'count', pythonLine: 6, activeLine: L('for (const x of inserted)'), value: v, less, greater, sorted: inserted.slice().sort((a, b) => a - b), cost, message: `Inserting ${v}: ${less} smaller and ${greater} larger values are present.` })
    cost += Math.min(less, greater)
    inserted.push(v)
    frames.push({ phase: 'insert', pythonLine: 8, activeLine: L('cost += Math.min'), value: v, less, greater, sorted: inserted.slice().sort((a, b) => a - b), cost, message: `Insert ${v}: it costs min(${less}, ${greater}) = ${Math.min(less, greater)}.` })
  })
  const result = cost % MOD
  frames.push({ phase: 'done', pythonLine: 10, activeLine: L('return cost % MOD'), value: null, less: null, greater: null, sorted: inserted.slice().sort((a, b) => a - b), cost: result, message: `Total cost: ${result}.` })
  return { input, result, frames }
}

export const code = `function createSortedArray(instructions) {
  const MOD = 1000000007
  let cost = 0
  const inserted = []
  for (const v of instructions) {
    let less = 0
    let greater = 0
    for (const x of inserted) {
      if (x < v) less++
      else if (x > v) greater++
    }
    cost += Math.min(less, greater)
    inserted.push(v)
  }
  return cost % MOD
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def create_sorted_array(instructions):
    MOD = 1000000007
    cost = 0
    inserted = []
    for v in instructions:
        less = sum(1 for x in inserted if x < v)
        greater = sum(1 for x in inserted if x > v)
        cost += min(less, greater)
        inserted.append(v)
    return cost % MOD
`
