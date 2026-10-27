const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { target, types } = data ?? {}
  if (!Number.isInteger(target) || target < 1 || target > 30) throw new Error('target must be an integer from 1 to 30.')
  if (!Array.isArray(types) || types.length < 1 || types.length > 4) throw new Error('types must list 1 to 4 pairs [count, marks].')
  for (const pair of types) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Each type is a pair [count, marks].')
    const [count, marks] = pair
    if (!Number.isInteger(count) || count < 1 || count > 8) throw new Error('count must be an integer from 1 to 8.')
    if (!Number.isInteger(marks) || marks < 1 || marks > 12) throw new Error('marks must be an integer from 1 to 12.')
  }
  return { target, types }
}

export const code = `number of ways to earn target points(target, types):
  set ways[0] to 1 and every other ways[p] to 0
  for each [count, marks] in types:
    for each total p from 0 up to target:
      set next[p] to 0
      for k from 0 up to count while k * marks <= p:
        add ways[p - k * marks] to next[p]
      keep next[p] modulo 1000000007
    replace ways with next
  return ways[target]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each type contributes 0 to count copies. Combining types one at a time is a bounded knapsack over points.
export function buildTrace({ target, types }) {
  let ways = Array(target + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', ways: [...ways], type: null, cell: null, activeLine: L('set ways[0] to 1'), message: `Count the ways to earn exactly ${target} points. Start with one way to earn 0 points.` }]
  types.forEach(([count, marks], t) => {
    const next = Array(target + 1).fill(0)
    frames.push({ phase: 'type', ways: [...ways], type: t, cell: null, activeLine: L('for each [count, marks]'), message: `Type ${t + 1}: up to ${count} questions, each worth ${marks} points.` })
    for (let p = 0; p <= target; p++) {
      let sum = 0
      for (let k = 0; k <= count && k * marks <= p; k++) sum = (sum + ways[p - k * marks]) % MOD
      next[p] = sum
      frames.push({ phase: 'cell', ways: [...next], type: t, cell: p, activeLine: L('add ways[p - k * marks]'), message: `${p} points: sum the ways from 0 to ${Math.min(count, Math.floor(p / marks))} questions of this type, giving ${sum}.` })
    }
    ways = next
  })
  const result = ways[target]
  frames.push({ phase: 'done', ways: [...ways], type: null, cell: target, activeLine: L('return ways[target]'), result, message: `There are ${result} ways to earn exactly ${target} points.` })
  return { input: { target, types }, result, frames }
}

export const python = `def number_of_ways(target, types):
    MOD = 1000000007
    ways = [0] * (target + 1)
    ways[0] = 1
    for count, marks in types:
        nxt = [0] * (target + 1)
        for p in range(target + 1):
            k = 0
            while k <= count and k * marks <= p:
                nxt[p] = (nxt[p] + ways[p - k * marks]) % MOD
                k += 1
        ways = nxt
    return ways[target]
`
