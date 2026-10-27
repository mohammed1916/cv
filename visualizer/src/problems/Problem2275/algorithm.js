export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, candidates.')
  const { candidates } = data
  if (!Array.isArray(candidates) || candidates.length < 1 || candidates.length > 30) throw new Error('candidates must be an array of 1 to 30 integers.')
  if (candidates.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Each candidate is an integer from 1 to 1000000.')
  return { candidates }
}

export function buildTrace({ candidates }) {
  const frames = []
  let best = 0
  let bestBit = -1
  frames.push({ phase: 'start', activeLine: L('set best to 0'), bit: -1, count: 0, best, bestBit, message: 'Start with no combination.' })
  for (let bit = 0; bit < 20; bit++) {
    const count = candidates.filter(v => (v >> bit) & 1).length
    frames.push({ phase: 'count', activeLine: L('count the candidates'), bit, count, best, bestBit, message: `${count} candidates have bit ${bit} set.` })
    if (count > best) {
      best = count
      bestBit = bit
      frames.push({ phase: 'record', activeLine: L('set best to the count'), bit, count, best, bestBit, message: `New best: ${count} candidates share bit ${bit}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), bit: bestBit, count: best, best, bestBit, message: `Largest combination size: ${best}.` })
  return { input: { candidates }, result: best, frames }
}

export const code = `largest combination with a nonzero bitwise AND
  set best to 0
  for each bit position from 0 to 19 do
    count the candidates that have this bit set
    if the count is greater than best then
      set best to the count
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def largest_combination(candidates):
    best = 0
    for bit in range(20):
        count = sum(1 for v in candidates if (v >> bit) & 1)
        if count > best:
            best = count
    return best
`
