export function parseInput(text) {
  const hours = JSON.parse(text)
  if (!Array.isArray(hours) || hours.length < 1 || hours.length > 24) throw new Error('Use a JSON array of 1 to 24 integers.')
  if (hours.some(h => !Number.isInteger(h) || h < 1 || h > 1000)) throw new Error('Hours are integers from 1 to 1000.')
  return hours
}

export function buildTrace(hours) {
  const remainders = new Array(24).fill(0)
  const seen = () => Object.fromEntries(remainders.map((c, r) => [r, c]).filter(([, c]) => c > 0))
  const frames = [{ phase: 'start', activeLine: L('remainder counts = 24 zeros'), index: -1, need: null, added: 0, total: 0, seen: {}, message: 'No hours have been seen yet. Pairs need remainders that add to 24 (or 0).' }]
  let total = 0
  for (let i = 0; i < hours.length; i++) {
    const h = hours[i]
    const need = (24 - (h % 24)) % 24
    const added = remainders[need]
    total += added
    remainders[h % 24] += 1
    frames.push({ phase: 'hour', activeLine: L('total = total + remainder'), index: i, need, added, total, seen: seen(), message: `Hour ${h} has remainder ${h % 24}; it pairs with ${added} earlier hour${added === 1 ? '' : 's'} that have remainder ${need}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, need: null, added: 0, total, seen: seen(), message: `Complete pairs: ${total}.` })
  return { input: hours, result: total, frames }
}

export const code = `count pairs whose hours make a complete day
  remainder counts = 24 zeros
  total = 0
  for each hour h in order
    need = (24 - h mod 24) mod 24
    total = total + remainder counts[need]
    remainder counts[h mod 24] = remainder counts[h mod 24] + 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_complete_day_pairs(hours):
    remainders = [0] * 24
    total = 0
    for h in hours:
        total += remainders[(-h) % 24]
        remainders[h % 24] += 1
    return total
`
