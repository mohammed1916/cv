export const phases = [
  { id: 'start', label: 'Start', description: 'Work out how many consecutive matches a run of k repeats needs, and reject arrays too short to hold it.' },
  { id: 'compare', label: 'Compare with gap m', description: 'Check whether the value at each position equals the value m places later, and extend the current run of matches.' },
  { id: 'found', label: 'Run complete', description: 'A run of matches long enough means a block of k copies of one length-m pattern sits back to back.' },
  { id: 'done', label: 'Complete', description: 'Report whether the pattern repeats k or more times.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [1, 2, 1, 2], "m": 2, "k": 2}.')
  const { arr, m, k } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 100 || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) {
    throw new Error('arr is a list of 1 to 100 integers from 1 to 100.')
  }
  if (!Number.isInteger(m) || m < 1 || m > 100) throw new Error('m is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 100) throw new Error('k is an integer from 1 to 100.')
  return { arr, m, k }
}

export function buildTrace({ arr, m, k }) {
  const need = (k - 1) * m
  const fits = m * k <= arr.length
  const snap = (index, run, found) => ({ arr, m, k, need, index, run, found })
  const frames = [{
    phase: 'start', activeLine: L('need = (k - 1) * m'), pythonLine: P('need = (k - 1) * m'),
    snapshot: snap(-1, 0, false),
    message: `A pattern of length ${m} must repeat ${k} times, so ${need} consecutive positions must match when shifted by ${m}.`,
  }]
  let result = false
  if (!fits) {
    frames.push({
      phase: 'done', activeLine: L('if m * k > len(arr)'), pythonLine: P('if m * k > len(arr)'),
      snapshot: snap(-1, 0, false),
      message: `${m} times ${k} is ${m * k}, which is longer than the array of ${arr.length}, so no block can fit.`,
    })
  } else if (need === 0) {
    result = true
    frames.push({
      phase: 'found', activeLine: L('if need == 0'), pythonLine: P('if need == 0'),
      snapshot: snap(-1, 0, true),
      message: 'k is 1, so any single block of length m already counts.',
    })
  } else {
    let run = 0
    for (let i = 0; i + m < arr.length; i++) {
      run = arr[i] === arr[i + m] ? run + 1 : 0
      if (run >= need) {
        result = true
        frames.push({
          phase: 'found', activeLine: L('if run >= need'), pythonLine: P('if run >= need'),
          snapshot: snap(i, run, true),
          message: `${run} matches in a row reach ${need}, so the block starting at position ${i + 1 - run} repeats ${k} times.`,
        })
        break
      }
      frames.push({
        phase: 'compare', activeLine: L('run = run + 1'), pythonLine: P('run = run + 1'),
        snapshot: snap(i, run, false),
        message: `arr[${i}] = ${arr[i]} and arr[${i + m}] = ${arr[i + m]} ${run ? 'match' : 'differ'}; the run is ${run} of ${need} needed.`,
      })
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return false'), pythonLine: python.trimEnd().split('\n').length - 1,
    snapshot: snap(-1, 0, result), message: `Return ${result ? 'true' : 'false'}.`,
  })
  return { input: { arr, m, k }, result, frames }
}

export const code = `contains repeated pattern (arr, m, k):
  if m * k > len(arr): return false
  need = (k - 1) * m
  if need == 0: return true
  run = 0
  for i from 0 while i + m < len(arr):
    run = run + 1 if arr[i] == arr[i + m] else 0
    if run >= need: return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def contains_pattern(arr, m, k):
    if m * k > len(arr):
        return False
    need = (k - 1) * m
    if need == 0:
        return True
    run = 0
    for i in range(len(arr) - m):
        run = run + 1 if arr[i] == arr[i + m] else 0
        if run >= need:
            return True
    return False
`
