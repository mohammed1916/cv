export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with weight.')
  const { weight } = input
  if (!Array.isArray(weight) || weight.length < 2 || weight.length > 40) throw new Error('weight has 2 to 40 entries here.')
  for (const value of weight) {
    if (!Number.isInteger(value) || value < 1 || value > 1e9) throw new Error('Each weight is an integer from 1 to 1000000000.')
  }
  return { weight }
}

export const code = `most balanced shipments in a line of parcels
  set count to 0
  set peak to 0, the heaviest parcel in the open shipment
  for each parcel x from left to right
    if x is strictly lighter than peak
      x can end this shipment, so add 1 to count
      reset peak to 0 so the next parcel opens a new shipment
    otherwise
      x becomes the new peak
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_balanced_shipments(weight):
    count = 0
    peak = 0
    for x in weight:
        if x < peak:
            count += 1
            peak = 0
        else:
            peak = x
    return count
`

const pythonLines = python.split('\n')
const lineIn = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Line missing: ${fragment}`)
  return index + 1
}
const L = fragment => lineIn(code.map(entry => entry.text), fragment)
const P = fragment => lineIn(pythonLines, fragment)

export function buildTrace({ weight }) {
  const frames = []
  let count = 0
  let peak = 0
  let start = 0
  const shipments = []
  const push = (phase, codeLine, pyLine, at, message) => frames.push({
    phase, activeLine: L(codeLine), pythonLine: P(pyLine), at, count, peak, start, shipments: shipments.map(s => ({ ...s })), message,
  })
  push('start', 'set count to 0', 'count = 0', -1, 'No shipment is open and none is closed.')
  for (let i = 0; i < weight.length; i++) {
    const x = weight[i]
    push('compare', 'if x is strictly lighter', 'if x < peak', i, peak === 0
      ? `Parcel ${i} (weight ${x}) opens a shipment: nothing is heavier yet.`
      : `Compare parcel ${i} (weight ${x}) with the peak ${peak}.`)
    if (x < peak) {
      count += 1
      shipments.push({ number: count, from: start, to: i, peak, last: x })
      push('ship', 'x can end this shipment', 'count += 1', i, `${x} < ${peak}: close shipment ${count} on parcels ${start} to ${i}. Stopping now leaves the most parcels for later.`)
      peak = 0
      start = i + 1
      push('ship', 'reset peak to 0', 'peak = 0', i, 'Reset the peak; the next parcel starts fresh.')
    } else {
      peak = x
      push('raise', 'x becomes the new peak', 'peak = x', i, `${x} is not lighter than the peak, so it cannot end the shipment. The peak is now ${x}.`)
    }
  }
  const leftover = weight.length - start
  push('done', 'return count', 'return count', -1, `Return ${count}.${leftover > 0 ? ` The last ${leftover} parcel${leftover === 1 ? '' : 's'} never met a lighter one and stay unshipped.` : ''}`)
  return { input: { weight }, result: count, frames }
}
