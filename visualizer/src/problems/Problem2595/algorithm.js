export function parseInput(text) {
  const data = JSON.parse(text)
  const { n } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('"n" is an integer from 1 to 1000.')
  return { n }
}

export function buildTrace({ n }) {
  const bits = []
  for (let i = 0; (n >> i) > 0; i++) bits.push((n >> i) & 1)
  let even = 0
  let odd = 0
  const frames = [{ phase: 'start', activeLine: L('set even count to 0'), bit: -1, even, odd, bits, message: `Bits of ${n} from position 0 upward.` }]
  bits.forEach((bit, i) => {
    if (bit) { if (i % 2 === 0) even++; else odd++ }
    frames.push({ phase: 'bit', activeLine: L('if the bit at position i is set'), bit: i, even, odd, bits, message: bit ? `Position ${i} is set and counts as ${i % 2 === 0 ? 'even' : 'odd'}.` : `Position ${i} is clear.` })
  })
  frames.push({ phase: 'done', activeLine: L('return [even count'), bit: -1, even, odd, bits, message: `Even positions: ${even}, odd positions: ${odd}.` })
  return { input: { n }, result: [even, odd], frames }
}

export const code = `count set bits at even and odd positions of n
  set even count to 0 and odd count to 0
  for each bit position i from 0 up to the highest set bit
    if the bit at position i is set then add 1 to the even count when i is even, otherwise to the odd count
  return [even count, odd count]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def even_odd_bits(n):
    counts = [0, 0]
    i = 0
    while n >> i:
        if (n >> i) & 1:
            counts[i % 2] += 1
        i += 1
    return counts
`
