export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with an amount key.')
  const { amount } = input
  if (!Array.isArray(amount) || amount.length !== 3) throw new Error('amount needs exactly 3 cups.')
  if (amount.some(v => !Number.isInteger(v) || v < 0 || v > 12)) throw new Error('Each cup holds an integer from 0 to 12.')
  return { amount }
}

export function buildTrace(input) {
  const cups = [...input.amount]
  let seconds = 0
  const frames = [{ phase: 'start', activeLine: L('set seconds to 0'), cups: cups.slice(), pair: [], second: 0, message: `Cups need ${cups.join(', ')} units of water.` }]
  while (cups.some(v => v > 0)) {
    const pair = cups.map((_, i) => i).filter(i => cups[i] > 0).sort((a, b) => cups[b] - cups[a] || a - b).slice(0, 2)
    for (const i of pair) cups[i] -= 1
    seconds += 1
    frames.push({ phase: 'fill', activeLine: L('fill those two cups'), cups: cups.slice(), pair, second: seconds, message: `Second ${seconds}: fill cups ${pair.join(' and ')}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return seconds'), cups: cups.slice(), pair: [], second: seconds, message: `All cups are full after ${seconds} seconds.` })
  return { input, result: seconds, frames }
}

export const code = `minimum seconds to fill all cups:
  set seconds to 0
  while some cup still needs water
    pick the two cups with the most water still needed
    fill those two cups for one second
    add one to seconds
  return seconds`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def fill_cups(amount):
    total = sum(amount)
    largest = max(amount)
    return max(largest, (total + 1) // 2)
`
