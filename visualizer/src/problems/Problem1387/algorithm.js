export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with lo, hi, and k.')
  const { lo, hi, k } = data
  if (!Number.isInteger(lo) || lo < 1 || lo > 1000) throw new Error('lo is an integer from 1 to 1000.')
  if (!Number.isInteger(hi) || hi < lo || hi > 1000) throw new Error('hi is an integer from lo to 1000.')
  if (hi - lo + 1 > 60) throw new Error('The visualization covers at most 60 integers, so hi minus lo must be below 60.')
  if (!Number.isInteger(k) || k < 1 || k > hi - lo + 1) throw new Error('k is an integer from 1 to the number of integers in the range.')
  return { lo, hi, k }
}

export function buildTrace(input) {
  const { lo, hi, k } = input
  const memo = new Map([[1, 0]])
  const steps = x => {
    if (memo.has(x)) return memo.get(x)
    const next = x % 2 === 0 ? x / 2 : 3 * x + 1
    const value = 1 + steps(next)
    memo.set(x, value)
    return value
  }

  const frames = [{ phase: 'start', activeLine: L('set table to nothing'), x: null, power: null, powers: [], order: [], message: `Find the ${k}th integer from ${lo} to ${hi} when sorted by power value.` }]
  const powers = []
  for (let x = lo; x <= hi; x++) {
    const power = steps(x)
    powers.push({ value: x, power })
    frames.push({ phase: 'visit', activeLine: L('record the number of steps'), x, power, powers: powers.map(e => ({ ...e })), order: [], message: `${x} takes ${power} step${power === 1 ? '' : 's'} to reach 1.` })
  }

  const order = powers.map(e => ({ ...e })).sort((a, b) => a.power - b.power || a.value - b.value)
  frames.push({ phase: 'sort', activeLine: L('sort the values'), x: null, power: null, powers: [], order, message: 'Sort by power value, with ties going to the smaller integer.' })
  const result = order[k - 1].value
  frames.push({ phase: 'done', activeLine: L('return the k-th'), x: null, power: null, powers: [], order, message: `The ${k}th integer in this order is ${result}.` })
  return { input, result, frames }
}

export const code = `k-th integer from lo to hi by power value
  set table to nothing
  for each value x from lo to hi
    record the number of steps for x to reach 1
  sort the values by steps, breaking ties by the smaller value
  return the k-th value in that order

steps(x)
  if x is 1 then return 0
  if memo already holds x then return it
  set next to x divided by 2 when x is even, otherwise 3 times x plus 1
  store 1 plus steps(next) for x and return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_kth(lo, hi, k):
    memo = {1: 0}

    def steps(x):
        if x in memo:
            return memo[x]
        nxt = x // 2 if x % 2 == 0 else 3 * x + 1
        memo[x] = 1 + steps(nxt)
        return memo[x]

    values = sorted(range(lo, hi + 1), key=lambda x: (steps(x), x))
    return values[k - 1]
`
