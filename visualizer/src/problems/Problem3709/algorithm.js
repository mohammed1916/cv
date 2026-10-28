// The design problem is run as a call list: operations[i] is "record" or "totalScore" and arguments[i]
// holds its two numbers. The result lists null for each record call and the sum for each query.

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with operations and arguments.')
  if (Object.keys(input).sort().join(',') !== 'arguments,operations') throw new Error('The object must have exactly the keys operations and arguments.')
  const { operations, arguments: args } = input
  if (!Array.isArray(operations) || !Array.isArray(args) || operations.length !== args.length) throw new Error('operations and arguments must be arrays of the same length.')
  if (operations.length < 1 || operations.length > 12) throw new Error('Use 1 to 12 calls for this visualization.')
  if (operations[0] !== 'record') throw new Error('The first call must be record.')
  let latest = 0
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i]
    const pair = args[i]
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error(`Call ${i} needs two integers.`)
    const [a, b] = pair
    if (op === 'record') {
      if (a < 1 || a > 1000000000 || b < 1 || b > 1000000000) throw new Error('record(time, score) needs 1 <= time, score <= 1000000000.')
      if (a <= latest) throw new Error('record times must strictly increase.')
      latest = a
    } else if (op === 'totalScore') {
      if (a < 1 || a > b || b > latest) throw new Error('totalScore(start, end) needs 1 <= start <= end <= the latest recorded time.')
    } else {
      throw new Error('Each operation is record or totalScore.')
    }
  }
  return { operations, arguments: args }
}

export function buildTrace(input) {
  const { operations, arguments: args } = input
  const times = []
  const scores = []
  const outputs = []
  const frames = [{ phase: 'start', activeLine: L('start with no exams'), call: -1, output: null, total: null, outputs: [], message: 'No exams are recorded yet.' }]
  operations.forEach((op, i) => {
    const [a, b] = args[i]
    if (op === 'record') {
      times.push(a)
      scores.push(b)
      outputs.push(null)
      frames.push({ phase: 'record', activeLine: L('append the time and score'), call: i, output: null, total: null, outputs: [...outputs], message: `Record time ${a} with score ${b}.` })
    } else {
      let sum = 0
      for (let k = 0; k < times.length; k++) if (times[k] >= a && times[k] <= b) sum += scores[k]
      outputs.push(sum)
      frames.push({ phase: 'query', activeLine: L('add the scores whose time is in the range'), call: i, output: sum, total: sum, outputs: [...outputs], message: `Total of exams from time ${a} to ${b}: ${sum}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the outputs'), call: -1, output: null, total: null, outputs: [...outputs], message: 'All calls are answered.' })
  return { input, result: outputs, frames }
}

export const code = `exam tracker over a list of calls
  start with no exams
  for each call in order
    if the call is record(time, score) then
      append the time and score to the exams
      output null
    otherwise
      add the scores whose time is in the range [start, end]
      output that sum
  return the outputs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from bisect import bisect_left, bisect_right

def exam_tracker(operations, arguments):
    times = []
    prefix = [0]
    out = []
    for op, args in zip(operations, arguments):
        if op == 'record':
            time, score = args
            times.append(time)
            prefix.append(prefix[-1] + score)
            out.append(None)
        else:
            start, end = args
            lo = bisect_left(times, start)
            hi = bisect_right(times, end)
            out.append(prefix[hi] - prefix[lo])
    return out
`
