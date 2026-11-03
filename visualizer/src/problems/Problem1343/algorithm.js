export const phases = [
  { id: 'start', label: 'Start', description: 'Set the target sum for a window: k times the threshold. Comparing sums avoids dividing by k.' },
  { id: 'window', label: 'First window', description: 'Add up the first k values once. This is the only full sum we compute.' },
  { id: 'slide', label: 'Slide', description: 'Move the window one place right: remove the value that leaves and add the value that enters.' },
  { id: 'check', label: 'Compare', description: 'Count the window when its sum is at least the target. Equality counts.' },
  { id: 'done', label: 'Complete', description: 'Return how many length-k windows met the target.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [2, 2, 2, 9], "k": 2, "threshold": 4}.')
  const { arr, k, threshold } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12 || !arr.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('arr is a list of 1 to 12 integers from 0 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error('k is an integer from 1 to the length of arr.')
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 20) throw new Error('threshold is an integer from 0 to 20.')
  return { arr, k, threshold }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (codeSub, pySub = codeSub) => ({ activeLine: L(codeSub), pythonLine: P(pySub) })

export function buildTrace({ arr, k, threshold }) {
  const frames = []
  const target = k * threshold
  const windows = arr.length - k + 1
  let sum = 0
  let count = 0
  frames.push({ phase: 'start', ...at('target = k'), message: `Each window needs a sum of at least ${k} × ${threshold} = ${target}. There are ${windows} windows of length ${k}.`, snapshot: { arr, k, start: null, sum: null, target, count } })

  for (let start = 0; start < windows; start++) {
    if (start === 0) {
      for (let i = 0; i < k; i++) sum += arr[i]
      frames.push({ phase: 'window', ...at('window = sum', 'window = sum'), message: `The first window covers values ${arr.slice(0, k).join(', ')} with sum ${sum}.`, snapshot: { arr, k, start, sum, target, count } })
    } else {
      const out = arr[start - 1]
      const incoming = arr[start + k - 1]
      sum = sum - out + incoming
      frames.push({ phase: 'slide', ...at('slide', 'window +='), message: `Slide right: drop ${out} and add ${incoming}. The window now starts at index ${start} with sum ${sum}.`, snapshot: { arr, k, start, sum, target, count, out, incoming } })
    }
    const ok = sum >= target
    if (ok) count += 1
    frames.push({
      phase: 'check', ...at('if window >= target', 'if window >= target'),
      message: ok ? `Sum ${sum} reaches ${target}, so this window counts. Total ${count}.` : `Sum ${sum} is below ${target}, so this window does not count.`,
      snapshot: { arr, k, start, sum, target, count, ok },
    })
  }

  frames.push({ phase: 'done', ...at('return count'), message: `${count} of the ${windows} windows have an average of at least ${threshold}.`, snapshot: { arr, k, start: null, sum, target, count, result: count } })
  return { input: { arr, k, threshold }, result: count, frames }
}

export const code = `count windows (arr, k, threshold):
  target = k * threshold
  window = sum of first k values
  count = 0
  for start from 0 to n - k:
    if start > 0: slide window by one value
    if window >= target: count += 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_windows(arr, k, threshold):
    target = k * threshold
    window = sum(arr[:k])
    count = 0
    for start in range(len(arr) - k + 1):
        if start > 0:
            window += arr[start + k - 1] - arr[start - 1]
        if window >= target:
            count += 1
    return count
`
