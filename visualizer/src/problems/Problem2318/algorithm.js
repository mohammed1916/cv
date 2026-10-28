const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const n = data?.n
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n must be an integer from 1 to 10.')
  return { n }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export const code = `count distinct roll sequences(n)
  ways maps (last roll, roll before it) to a count; 0 means none. Start with ways[(0, 0)] = 1
  repeat n times
    next = empty map
    for each state (last, before) with a count
      for each roll v from 1 to 6
        if last is set and gcd(v, last) is not 1 then skip v
        if v equals last or v equals before then skip v
        next[(v, last)] += count, modulo 1000000007
    ways = next
  return the sum of all counts, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The two most recent rolls are all the state needed, because a repeat is forbidden within two rolls.
export function buildTrace({ n }) {
  let ways = new Map([['0,0', 1]])
  const table = () => {
    const grid = Array.from({ length: 7 }, () => Array(7).fill(0))
    for (const [key, count] of ways) {
      const [last, before] = key.split(',').map(Number)
      grid[last][before] = count
    }
    return grid
  }
  const frames = [{ phase: 'start', step: 0, table: table(), activeLine: L('ways[(0, 0)] = 1'), message: 'No rolls yet. Row 0 and column 0 stand for "no roll".' }]
  for (let step = 1; step <= n; step++) {
    const next = new Map()
    for (const [key, count] of ways) {
      const [last, before] = key.split(',').map(Number)
      for (let v = 1; v <= 6; v++) {
        if (last !== 0 && gcd(v, last) !== 1) continue
        if (v === last || v === before) continue
        const k = `${v},${last}`
        next.set(k, ((next.get(k) ?? 0) + count) % MOD)
      }
    }
    ways = next
    frames.push({ phase: 'step', step, table: table(), activeLine: L('ways = next'), message: `After ${step} roll${step === 1 ? '' : 's'} there are ${[...ways.values()].reduce((a, b) => (a + b) % MOD, 0)} valid sequences.` })
  }
  const result = [...ways.values()].reduce((a, b) => (a + b) % MOD, 0)
  frames.push({ phase: 'done', step: n, table: table(), activeLine: L('return the sum of all counts'), message: `Distinct roll sequences: ${result}.` })
  return { input: { n }, result, frames }
}

export const python = `def distinct_roll_sequences(n):
    from math import gcd
    MOD = 1000000007
    ways = {(0, 0): 1}
    for _ in range(n):
        nxt = {}
        for (last, before), count in ways.items():
            for v in range(1, 7):
                if last != 0 and gcd(v, last) != 1:
                    continue
                if v == last or v == before:
                    continue
                key = (v, last)
                nxt[key] = (nxt.get(key, 0) + count) % MOD
        ways = nxt
    return sum(ways.values()) % MOD
`
