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
  const frames = [{ phase: 'start', activeLine: L('set cost to 0'), index: null, less: null, greater: null, cost: 0, inserted: [], message: 'Insert each value into a growing sorted array, paying the cheaper side each time.' }]
  values.forEach((v, i) => {
    const less = inserted.filter(x => x < v).length
    const greater = inserted.filter(x => x > v).length
    cost += Math.min(less, greater)
    inserted.push(v)
    frames.push({ phase: 'insert', activeLine: L('add the smaller'), index: i, less, greater, cost, inserted: inserted.slice(), message: `Insert ${v}: ${less} smaller and ${greater} larger values are already present, so it costs ${Math.min(less, greater)}.` })
  })
  const result = cost % MOD
  frames.push({ phase: 'done', activeLine: L('return cost'), index: null, less: null, greater: null, cost: result, inserted: inserted.slice(), message: `Total cost: ${result}.` })
  return { input, result, frames }
}

export const code = `total cost of creating a sorted array by inserting each value:
  set cost to 0
  set inserted to an empty list
  for each value v in order:
    count less, the inserted values below v
    count greater, the inserted values above v
    add the smaller of less and greater to cost
    add v to inserted
  return cost modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
