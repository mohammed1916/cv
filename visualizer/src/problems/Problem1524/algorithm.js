export const phases = [
  { id: 'start', label: 'Start', description: 'The empty prefix has sum 0, which is even, so one even prefix exists before any value.' },
  { id: 'parity', label: 'Update parity', description: 'Track whether the prefix sum up to this value is odd or even.' },
  { id: 'count', label: 'Count pairs', description: 'Every earlier prefix with the opposite parity forms an odd-sum subarray ending here.' },
  { id: 'record', label: 'Store prefix', description: 'Record the current prefix parity for the values that follow.' },
  { id: 'done', label: 'Complete', description: 'Return the number of odd-sum subarrays modulo 1000000007.' },
]

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200 || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Enter a JSON array of 1 to 200 integers from 1 to 100.')
  return { arr }
}

export const code = `count odd-sum subarrays (arr):
  even_prefixes = 1
  odd_prefixes = 0
  parity = 0
  total = 0
  for each value v in arr:
    parity = (parity + v) mod 2
    if parity == 1:
      total = (total + even_prefixes) mod 1000000007
      odd_prefixes += 1
    else:
      total = (total + odd_prefixes) mod 1000000007
      even_prefixes += 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def num_of_subarrays(arr):
    MOD = 10**9 + 7
    even, odd = 1, 0
    parity = 0
    total = 0
    for v in arr:
        parity = (parity + v) % 2
        if parity == 1:
            total = (total + even) % MOD
            odd += 1
        else:
            total = (total + odd) % MOD
            even += 1
    return total
`

const PS = { start: 2, parity: 7, countOdd: 9, recordOdd: 10, countEven: 12, recordEven: 13, done: 14 }
const PY = { start: 3, parity: 7, countOdd: 9, recordOdd: 10, countEven: 12, recordEven: 13, done: 14 }

export function buildTrace({ arr }) {
  const MOD = 1000000007
  let even = 1
  let odd = 0
  let parity = 0
  let total = 0
  const snap = (index, value, added) => ({ index, value, parity, odd, even, total, added })
  const frames = [{ phase: 'start', activeLine: PS.start, pythonLine: PY.start, snapshot: snap(null, null, 0), message: 'The empty prefix has even sum. Only the even count is 1 before any value is read.' }]
  arr.forEach((value, index) => {
    parity = (parity + value) % 2
    frames.push({ phase: 'parity', activeLine: PS.parity, pythonLine: PY.parity, snapshot: snap(index, value, 0), message: `Value ${value} changes the prefix parity to ${parity === 1 ? 'odd' : 'even'}.` })
    if (parity === 1) {
      const added = even
      total = (total + added) % MOD
      frames.push({ phase: 'count', activeLine: PS.countOdd, pythonLine: PY.countOdd, snapshot: snap(index, value, added), message: `Parity is odd, so the ${added} earlier even prefixes each form an odd-sum subarray ending here. Add ${added}.` })
      odd += 1
      frames.push({ phase: 'record', activeLine: PS.recordOdd, pythonLine: PY.recordOdd, snapshot: snap(index, value, added), message: `Store this odd prefix. Odd prefixes stored: ${odd}.` })
    } else {
      const added = odd
      total = (total + added) % MOD
      frames.push({ phase: 'count', activeLine: PS.countEven, pythonLine: PY.countEven, snapshot: snap(index, value, added), message: `Parity is even, so the ${added} earlier odd prefixes form odd-sum subarrays ending here. Add ${added}.` })
      even += 1
      frames.push({ phase: 'record', activeLine: PS.recordEven, pythonLine: PY.recordEven, snapshot: snap(index, value, added), message: `Store this even prefix. Even prefixes stored: ${even}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: PS.done, pythonLine: PY.done, snapshot: snap(null, null, 0), message: `Total odd-sum subarrays: ${total}.` })
  return { input: { arr }, result: total, frames }
}
