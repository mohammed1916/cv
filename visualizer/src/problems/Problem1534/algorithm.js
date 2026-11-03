export const phases = [
  { id: 'start', label: 'Start', description: 'Start with no good triples. Every index triple i < j < k is checked once.' },
  { id: 'test', label: 'Test a triple', description: 'Check the three distance limits for this triple. A triple fails as soon as one limit is broken.' },
  { id: 'count', label: 'Good triple', description: 'All three limits hold, so this triple is counted.' },
  { id: 'done', label: 'Total', description: 'All index triples have been checked.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [1, 2, 3], "a": 1, "b": 1, "c": 2}.')
  const { arr, a, b, c } = input
  if (!Array.isArray(arr) || arr.length < 3 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('arr is a list of 3 to 12 integers from 0 to 20.')
  for (const [name, limit] of [['a', a], ['b', b], ['c', c]]) {
    if (!Number.isInteger(limit) || limit < 0 || limit > 20) throw new Error(`${name} is an integer from 0 to 20.`)
  }
  return { arr, a, b, c }
}

export const code = `count good triplets (arr, a, b, c):
  count = 0
  for i from 0 to n - 1:
    for j from i + 1 to n - 1:
      for k from j + 1 to n - 1:
        if |arr[i] - arr[j]| <= a and |arr[j] - arr[k]| <= b and |arr[i] - arr[k]| <= c:
          count = count + 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_good_triplets(arr, a, b, c):
    count = 0
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if abs(arr[i] - arr[j]) <= a and abs(arr[j] - arr[k]) <= b and abs(arr[i] - arr[k]) <= c:
                    count += 1
    return count
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace({ arr, a, b, c }) {
  const frames = []
  let count = 0
  const n = arr.length
  const snap = (i, j, k, checks) => ({ arr, a, b, c, i, j, k, checks, count })
  frames.push({ phase: 'start', ...at('count = 0', 'count = 0'), message: `No good triples yet. Check every index triple i < j < k of the ${n} values against limits a=${a}, b=${b}, c=${c}.`, snapshot: snap(null, null, null, null) })
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const d1 = Math.abs(arr[i] - arr[j]), d2 = Math.abs(arr[j] - arr[k]), d3 = Math.abs(arr[i] - arr[k])
        const checks = [d1 <= a, d2 <= b, d3 <= c]
        const ijk = `(${i}, ${j}, ${k}) with values ${arr[i]}, ${arr[j]}, ${arr[k]}`
        if (checks.every(Boolean)) {
          count += 1
          frames.push({ phase: 'count', ...at('count = count + 1', 'count += 1'), message: `Triple ${ijk}: |${arr[i]} - ${arr[j]}| = ${d1} <= ${a}, |${arr[j]} - ${arr[k]}| = ${d2} <= ${b}, |${arr[i]} - ${arr[k]}| = ${d3} <= ${c}. Good triple; count is ${count}.`, snapshot: snap(i, j, k, checks) })
        } else {
          const failed = [`|${arr[i]} - ${arr[j]}| = ${d1} is over ${a}`, `|${arr[j]} - ${arr[k]}| = ${d2} is over ${b}`, `|${arr[i]} - ${arr[k]}| = ${d3} is over ${c}`].filter((_, idx) => !checks[idx])
          frames.push({ phase: 'test', ...at('if |arr[i]', 'if abs(arr[i]'), message: `Triple ${ijk}: ${failed.join('; ')}, so it is not good.`, snapshot: snap(i, j, k, checks) })
        }
      }
    }
  }
  frames.push({ phase: 'done', ...at('return count', 'return count'), message: `Return ${count}, the number of good triples.`, snapshot: snap(null, null, null, null) })
  return { input: { arr, a, b, c }, result: count, frames }
}
