const MOD = 1000000007

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new Error('Use an integer number of plots from 1 to 60.')
  return n
}

export function buildTrace(n) {
  // ways[i]: arrangements on one side of the street with i plots and no two houses next to each other.
  const ways = [1, 2]
  const frames = [{ phase: 'start', activeLine: L('set ways[0]'), i: 1, ways: [...ways], message: 'One plot has 2 options on a side: empty or a house. Both sides multiply together at the end.' }]
  for (let i = 2; i <= n; i++) {
    ways.push((ways[i - 1] + ways[i - 2]) % MOD)
    frames.push({ phase: 'extend', activeLine: L('sum of the two previous'), i, ways: [...ways], message: `Plots ${i}: ${ways[i - 1]} + ${ways[i - 2]} = ${ways[i]} arrangements on one side (mod 1000000007).` })
  }
  const result = Number((BigInt(ways[n]) * BigInt(ways[n])) % BigInt(MOD))
  frames.push({ phase: 'done', activeLine: L('return ways[n] squared'), i: n, ways: [...ways], message: `Both sides: ${ways[n]} squared is ${result} modulo 1000000007.` })
  return { input: n, result, frames, ways }
}

export const code = `number of ways to place houses on n plots on both sides:
  set ways[0] to 1 and ways[1] to 2
  for each plot count i from 2 to n:
    ways[i] is the sum of the two previous counts, modulo 1000000007
  one side has ways[n] arrangements
  return ways[n] squared, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_house_placements(n):
    mod = 1000000007
    ways = [1, 2]
    for i in range(2, n + 1):
        ways.append((ways[i - 1] + ways[i - 2]) % mod)
    return ways[n] * ways[n] % mod
`
