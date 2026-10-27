export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.derived)) throw new Error('Use an object such as {"derived":[1,1,0]}.')
  const { derived } = data
  if (derived.length < 1 || derived.length > 12) throw new Error('derived has 1 to 12 entries in this visualization.')
  if (!derived.every(v => v === 0 || v === 1)) throw new Error('derived holds only 0 and 1.')
  return { derived }
}

export function buildTrace({ derived }) {
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, total, message: 'Xor every derived bit together. Each original bit appears twice in this sum, so it cancels.' }]
  derived.forEach((bit, index) => {
    total ^= bit
    frames.push({ phase: 'fold', activeLine: L('set total to total xor bit'), index, total, message: `Xor in derived[${index}] = ${bit}. Running total: ${total}.` })
  })
  const result = total === 0
  frames.push({ phase: 'done', activeLine: L('return whether total is 0'), index: -1, total, message: result ? 'The total is 0, so a binary original exists.' : 'The total is 1, so no binary original exists.' })
  return { input: { derived }, result, frames }
}

export const code = `can a binary original produce derived:
  set total to 0
  for each bit in derived do
    set total to total xor bit
  xoring all derived bits cancels every original bit exactly twice
  if total is 0 then an original exists
  return whether total is 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def neighboring_xor_possible(derived):
    total = 0
    for bit in derived:
        total ^= bit
    return total == 0
`
