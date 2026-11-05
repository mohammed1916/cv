export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('Use "nums" as an array of 2 to 8 numbers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each number is an integer from 1 to 20.')
  return { nums }
}

export function buildTrace({ nums }) {
  const values = nums.map(x => (x % 2 ? x * 2 : x))
  let best = Infinity
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const values = nums.map'), values: [...values], picked: -1, best, message: 'Double every odd number, so each value can now only be halved.' }]
  for (;;) {
    let at = 0
    for (let i = 1; i < values.length; i++) if (values[i] > values[at]) at = i
    const top = values[at]
    const low = Math.min(...values)
    best = Math.min(best, top - low)
    frames.push({ phase: 'measure', pythonLine: 10, activeLine: L('best = Math.min(best'), values: [...values], picked: at, best, message: `Largest ${top}, smallest ${low}, deviation ${top - low}. Best so far ${best}.` })
    if (top % 2) break
    values[at] = top / 2
    frames.push({ phase: 'halve', pythonLine: 13, activeLine: L('values[top] /= 2'), values: [...values], picked: at, best, message: `Halve ${top} to ${top / 2}.` })
  }
  frames.push({ phase: 'done', pythonLine: 15, activeLine: L('return best'), values: [...values], picked: -1, best, message: `Minimum deviation: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function minimizeDeviation(nums) {
  const values = nums.map(x => (x % 2 ? x * 2 : x))
  let smallest = Math.min(...values)
  let best = Infinity
  for (;;) {
    let top = 0
    for (let i = 1; i < values.length; i++) if (values[i] > values[top]) top = i
    best = Math.min(best, values[top] - smallest)
    if (values[top] % 2) break
    values[top] /= 2
    smallest = Math.min(smallest, values[top])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_deviation(nums):
    values = [x * 2 if x % 2 else x for x in nums]
    smallest = min(values)
    best = float('inf')
    while True:
        top = 0
        for i in range(1, len(values)):
            if values[i] > values[top]:
                top = i
        best = min(best, values[top] - smallest)
        if values[top] % 2:
            break
        values[top] //= 2
        smallest = min(smallest, values[top])
    return best
`
