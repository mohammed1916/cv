export const phases = [
  { id: 'start', label: 'Start', description: 'Start with a run length of 0: no odd values have been seen in a row yet.' },
  { id: 'check', label: 'Check value', description: 'Look at the next value and decide whether it is odd.' },
  { id: 'extend', label: 'Extend run', description: 'The value is odd, so the run of consecutive odd values grows by one.' },
  { id: 'reset', label: 'Reset run', description: 'The value is even, so the run starts again from zero.' },
  { id: 'found', label: 'Found three', description: 'Three odd values in a row exist, so the answer is true.' },
  { id: 'done', label: 'Complete', description: 'No run of three odd values was found, so the answer is false.' },
]

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 20 || !values.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Enter a JSON array of 1 to 20 integers from -20 to 20.')
  return values
}

export const code = [
  "function threeConsecutiveOdds(arr) {",
  "  let run = 0",
  "  for (const value of arr) {",
  "    if (Math.abs(value) % 2 === 1) run += 1",
  "    else run = 0",
  "    if (run === 3) return true }",
  "  return false }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def three_consecutive_odds(arr):
    run = 0
    for value in arr:
        if value % 2:
            run = run + 1
        else:
            run = 0
        if run == 3:
            return True
    return False
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const isOdd = v => Math.abs(v) % 2 === 1

export function buildTrace(arr) {
  const frames = []
  let run = 0
  const snap = extra => ({ run, ...extra })
  frames.push({ phase: 'start', activeLine: L('run = 0'), pythonLine: P('run = 0'), snapshot: snap({ index: -1, odd: null }),
    message: `Read ${arr.length} values left to right. The run starts at 0.` })
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    const odd = isOdd(v)
    frames.push({ phase: 'check', activeLine: L('if (Math.abs(value) % 2 === 1)'), pythonLine: P('if value % 2'), snapshot: snap({ index: i, value: v, odd }),
      message: `Value ${v} at index ${i} is ${odd ? 'odd' : 'even'}.` })
    if (odd) {
      run += 1
      frames.push({ phase: 'extend', activeLine: L('run += 1'), pythonLine: P('run = run + 1'), snapshot: snap({ index: i, value: v, odd }),
        message: `The run of odd values is now ${run}.` })
    } else {
      run = 0
      frames.push({ phase: 'reset', activeLine: L('else run = 0'), pythonLine: P('run = 0'), snapshot: snap({ index: i, value: v, odd }),
        message: `An even value breaks any run, so the run resets to 0.` })
    }
    if (run === 3) {
      frames.push({ phase: 'found', activeLine: L('return true'), pythonLine: P('return True'), snapshot: snap({ index: i, value: v, odd }),
        message: `Three odd values in a row end at index ${i}. Return true.` })
      return { input: arr, result: true, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: snap({ index: arr.length, odd: null }),
    message: 'The scan ended without three odd values in a row. Return false.' })
  return { input: arr, result: false, frames }
}
