const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { low, high, zero, one } = data ?? {}
  if (!Number.isInteger(high) || high < 1 || high > 14) throw new Error('high must be an integer from 1 to 14.')
  if (!Number.isInteger(low) || low < 1 || low > high) throw new Error('low must be an integer from 1 to high.')
  for (const [name, value] of [['zero', zero], ['one', one]]) {
    if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error(`${name} must be an integer from 1 to 6.`)
  }
  return { low, high, zero, one }
}

export const code = `count good strings(low, high, zero, one)
  ways = array of high + 1 zeros
  ways[0] = 1
  for length from 1 to high
    if length ≥ zero then ways[length] += ways[length - zero]
    if length ≥ one then ways[length] += ways[length - one]
    ways[length] = ways[length] modulo 1000000007
  total = sum of ways[length] for length from low to high, modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// ways[len] counts the strings of length len that end at the right place, built by appending blocks of zero or one.
export function buildTrace({ low, high, zero, one }) {
  const ways = Array(high + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', length: 0, ways: [...ways], activeLine: L('ways = array of'), message: 'There is one way to build the empty string.' }]
  for (let length = 1; length <= high; length++) {
    if (length >= zero) ways[length] += ways[length - zero]
    if (length >= one) ways[length] += ways[length - one]
    ways[length] %= MOD
    frames.push({ phase: 'length', length, ways: [...ways], activeLine: L('ways[length] = ways[length] modulo'), message: `Strings of length ${length}: ${ways[length]}.` })
  }
  let result = 0
  for (let length = low; length <= high; length++) result = (result + ways[length]) % MOD
  frames.push({ phase: 'done', length: high, ways: [...ways], activeLine: L('return total'), message: `Good strings with length from ${low} to ${high}: ${result}.` })
  return { input: { low, high, zero, one }, result, frames }
}

export const python = `def count_good_strings(low, high, zero, one):
    MOD = 1000000007
    ways = [0] * (high + 1)
    ways[0] = 1
    for length in range(1, high + 1):
        if length >= zero:
            ways[length] += ways[length - zero]
        if length >= one:
            ways[length] += ways[length - one]
        ways[length] %= MOD
    return sum(ways[low:high + 1]) % MOD
`
