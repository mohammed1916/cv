export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with rolls and k.')
  const { rolls, k } = data
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('k is an integer from 1 to 4.')
  if (!Array.isArray(rolls) || rolls.length < 1 || rolls.length > 10) throw new Error('rolls must have 1 to 10 entries.')
  if (rolls.some(v => !Number.isInteger(v) || v < 1 || v > k)) throw new Error('Each roll is an integer from 1 to k.')
  return { rolls, k }
}

export function buildTrace(input) {
  const { rolls, k } = input
  let seen = new Set()
  let blocks = 0
  const frames = [{ phase: 'start', activeLine: L('set blocks to zero'), index: -1, seen: [], blocks, message: `Cut the rolls into blocks. A block ends once every face from 1 to ${k} has appeared.` }]
  rolls.forEach((roll, i) => {
    seen.add(roll)
    if (seen.size === k) {
      blocks += 1
      frames.push({ phase: 'block', activeLine: L('clear seen'), index: i, seen: [...seen], blocks, message: `Roll ${i}: block ${blocks} is complete, so the next block starts fresh.` })
      seen = new Set()
    } else {
      frames.push({ phase: 'roll', activeLine: L('add the roll to seen'), index: i, seen: [...seen], blocks, message: `Roll ${roll} joins the current block. ${seen.size} of ${k} faces seen.` })
    }
  })
  const result = blocks + 1
  frames.push({ phase: 'done', activeLine: L('return blocks plus one'), index: -1, seen: [...seen], blocks, message: `Shortest impossible length: ${result}.` })
  return { input, result, frames }
}

export const code = `length of the shortest sequence of rolls that cannot appear in order:
  set blocks to zero and seen to an empty set
  for each roll in order
    add the roll to seen
    if seen holds every face from 1 to k then
      increase blocks by one and clear seen
    otherwise
      keep going with the same block
  return blocks plus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_impossible_sequence(rolls, k):
    seen = set()
    blocks = 0
    for roll in rolls:
        seen.add(roll)
        if len(seen) == k:
            blocks += 1
            seen = set()
    return blocks + 1
`
