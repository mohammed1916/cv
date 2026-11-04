const MAX_ARR = 24
const MAX_STEPS = 30
const LIMIT = 10000

export const phases = [
  { id: 'create', label: 'Create', description: 'The generator exists but has not run yet.' },
  { id: 'first', label: 'First value', description: 'The first call yields the value at startIndex.' },
  { id: 'receive', label: 'Receive', description: 'The caller passes in the next jump.' },
  { id: 'move', label: 'Move', description: 'Add the jump and reduce it onto the ring.' },
  { id: 'yield', label: 'Yield', description: 'Hand back the value at the new index.' },
  { id: 'done', label: 'Result', description: 'Every requested value has been produced.' },
]

export const code = `make a generator over arr, starting at startIndex
  remember the current index
  repeat forever
    yield arr[index] and wait for the next jump
    set index to (index + jump) reduced modulo n, kept non-negative
call the generator once with no jump, keep its value
for each jump in steps
  resume the generator with that jump, keep its value
return the kept values`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def cycle_generator(arr, start_index):
    n = len(arr)
    index = start_index
    while True:
        jump = yield arr[index]
        index = (index + jump) % n


def run_generator(arr, steps, startIndex):
    gen = cycle_generator(arr, startIndex)
    output = [next(gen)]
    for jump in steps:
        output.append(gen.send(jump))
    return output
`

const lineOf = (lines, s) => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Code line missing: ${s}`)
  return index + 1
}
const pythonLines = python.trim().split('\n')
const L = s => lineOf(code.map(c => c.text), s)
const P = s => lineOf(pythonLines, s)

const isValue = v => Number.isInteger(v) && v >= -LIMIT && v <= LIMIT

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arr, steps and startIndex.')
  const { arr, steps, startIndex } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_ARR) throw new Error(`arr has 1 to ${MAX_ARR} entries here.`)
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > MAX_STEPS) throw new Error(`steps has 1 to ${MAX_STEPS} entries here.`)
  if (!arr.every(isValue)) throw new Error(`Each arr value is an integer from -${LIMIT} to ${LIMIT}.`)
  if (!steps.every(isValue)) throw new Error(`Each jump is an integer from -${LIMIT} to ${LIMIT}.`)
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= arr.length) throw new Error('startIndex must be a valid index of arr.')
  return { arr, steps, startIndex }
}

// True modulo: the result is always in 0..n-1, even for a negative sum.
const ring = (value, n) => ((value % n) + n) % n

export function buildTrace({ arr, steps, startIndex }) {
  const n = arr.length
  const frames = []
  const output = []
  let index = startIndex
  const base = () => ({ index, output: [...output], call: output.length, jump: null, from: null, sum: null, laps: 0, rest: 0, wraps: 0 })
  frames.push({ ...base(), phase: 'create', activeLine: L('remember the current index'), pythonLine: P('index = start_index'), message: `The generator starts at index ${index}. Nothing has been yielded yet.` })
  output.push(arr[index])
  frames.push({ ...base(), call: 0, phase: 'first', activeLine: L('yield arr[index]'), pythonLine: P('jump = yield'), message: `The first call takes no jump and yields arr[${index}] = ${arr[index]}.` })
  steps.forEach((jump, s) => {
    frames.push({ ...base(), call: s + 1, jump, phase: 'receive', activeLine: L('resume the generator'), pythonLine: P('gen.send(jump)'), message: `Call ${s + 1} sends jump ${jump} into the paused generator.` })
    const from = index
    const sum = from + jump
    index = ring(sum, n)
    const size = Math.abs(jump)
    const laps = Math.floor(size / n)
    const rest = size % n
    const wraps = Math.abs(Math.floor(sum / n))
    const lapText = laps ? `${laps} full lap${laps === 1 ? '' : 's'} and ${rest} step${rest === 1 ? '' : 's'}` : `${rest} step${rest === 1 ? '' : 's'}`
    frames.push({ ...base(), call: s + 1, jump, from, sum, laps, rest, wraps, phase: 'move', activeLine: L('set index to'), pythonLine: P('index = (index + jump) % n'), message: jump === 0 ? `Jump 0 stays on index ${from}.` : `${from} + (${jump}) = ${sum}, which lands on index ${index} after ${lapText}${wraps ? `, crossing the seam ${wraps} time${wraps === 1 ? '' : 's'}` : ''}.` })
    output.push(arr[index])
    frames.push({ ...base(), call: s + 1, jump, from, sum, laps, rest, wraps, phase: 'yield', activeLine: L('yield arr[index]'), pythonLine: P('jump = yield'), message: `Yield arr[${index}] = ${arr[index]} and pause again.` })
  })
  frames.push({ ...base(), call: output.length, phase: 'done', activeLine: L('return the kept values'), pythonLine: P('return output'), message: `The ${output.length} calls produced [${output.join(', ')}].` })
  return { input: { arr, steps, startIndex }, result: output, frames }
}
