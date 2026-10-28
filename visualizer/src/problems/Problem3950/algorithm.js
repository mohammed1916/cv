export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n)) throw new Error('Use {"n": n} with an integer n.')
  if (data.n < 0 || data.n > 100000) throw new Error('n is an integer from 0 to 100000.')
  return { n: data.n }
}

export function buildTrace(input) {
  let m = input.n
  let previous = 0
  let pairs = 0
  const frames = [{ phase: 'start', activeLine: L('let pairs be 0'), bit: null, pairs, bits: input.n.toString(2), message: `Scan the binary form of ${input.n} from the lowest bit.` }]
  while (m > 0) {
    const bit = m % 2
    if (bit === 1 && previous === 1) {
      pairs++
      frames.push({ phase: 'pair', activeLine: L('if bit and previous'), bit, pairs, bits: input.n.toString(2), message: `Two set bits are adjacent here. Pairs so far: ${pairs}.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if bit and previous'), bit, pairs, bits: input.n.toString(2), message: `Bit ${bit} does not form a new pair.` })
    }
    previous = bit
    m = Math.floor(m / 2)
  }
  const result = pairs === 1
  frames.push({ phase: 'done', activeLine: L('return pairs equals 1'), bit: null, pairs, bits: input.n.toString(2), message: `${pairs} pair(s), so the answer is ${result}.` })
  return { input, result, frames }
}

export const code = `exactly one consecutive set bits pair in n
  let pairs be 0
  let previous be 0
  while n is greater than 0
    let bit be n mod 2
    if bit and previous are both 1 then add 1 to pairs
    let previous be bit
    n becomes n divided by 2 rounded down
  return pairs equals 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def exactly_one_consecutive_set_bits_pair(n):
    pairs = 0
    previous = 0
    m = n
    while m > 0:
        bit = m % 2
        if bit == 1 and previous == 1:
            pairs += 1
        previous = bit
        m //= 2
    return pairs == 1
`
