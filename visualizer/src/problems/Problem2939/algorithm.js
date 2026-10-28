const MOD = 1000000007n

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with a, b and n.')
  const { a, b, n } = value
  if (!Number.isInteger(a) || a < 0 || a > 255) throw new Error('a is an integer from 0 to 255.')
  if (!Number.isInteger(b) || b < 0 || b > 255) throw new Error('b is an integer from 0 to 255.')
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8.')
  return { a, b, n }
}

export function buildTrace({ a, b, n }) {
  let x = 0
  // Bits at n and above are fixed, because x only has bits below n.
  let gap = ((a >> n) << n) - ((b >> n) << n)
  const frames = [{ phase: 'start', activeLine: L('set x to 0'), bit: null, x, gap, message: `Bits at position ${n} and above stay fixed, so the gap starts at ${gap}.` }]
  for (let i = n - 1; i >= 0; i--) {
    const bit = 1 << i
    const aBit = (a & bit) ? 1 : 0
    const bBit = (b & bit) ? 1 : 0
    if (aBit === bBit) {
      if (aBit === 0) x |= bit
      frames.push({ phase: 'agree', activeLine: L('if the bits agree'), bit: i, x, gap, message: `Bit ${i}: both values have ${aBit}. Setting both to 1 adds the most, so x ${aBit === 0 ? 'sets' : 'keeps'} this bit ${aBit === 0 ? '1' : '0'}.` })
    } else {
      const wantAOne = gap <= 0
      if ((aBit === 1) !== wantAOne) x |= bit
      gap += wantAOne ? bit : -bit
      frames.push({ phase: 'split', activeLine: L('give the one'), bit: i, x, gap, message: `Bit ${i} differs. Give the 1 to the ${wantAOne ? 'first' : 'second'} value to keep the gap small; gap is now ${gap}.` })
    }
  }
  const p = (a ^ x)
  const q = (b ^ x)
  const result = Number((BigInt(p) * BigInt(q)) % MOD)
  frames.push({ phase: 'done', activeLine: L('return (a xor x)'), bit: null, x, gap, message: `(${p} xor ...) product modulo 1000000007 is ${result}.` })
  return { input: { a, b, n }, result, frames }
}

export const code = `maximum xor product modulo 1000000007:
  set x to 0 and gap to the difference of the bits at n and above
  for each bit from n minus 1 down to 0 do
    if the bits agree then
      if both bits are 0 then set this bit of x
    otherwise give the one to the value that keeps gap near zero
  return (a xor x) times (b xor x) modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_xor_product(a, b, n):
    x = 0
    gap = ((a >> n) << n) - ((b >> n) << n)
    for i in range(n - 1, -1, -1):
        bit = 1 << i
        a_bit = 1 if a & bit else 0
        b_bit = 1 if b & bit else 0
        if a_bit == b_bit:
            if a_bit == 0:
                x |= bit
        else:
            want_a_one = gap <= 0
            if (a_bit == 1) != want_a_one:
                x |= bit
            gap += bit if want_a_one else -bit
    return ((a ^ x) * (b ^ x)) % 1000000007
`
