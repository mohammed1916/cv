export const code = `the largest value an alternating sequence of length n starting at s can contain
  if n is one then return s
  set best to s
  for each first direction, up and then down
    set value to s and direction to that first direction
    repeat n minus one times
      if direction is up then add m to value, otherwise subtract one from value
      if value is larger than best then set best to value
      flip direction
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def max_alternating_value(start, n, m):
    if n == 1:
        return start
    best = start
    for first_up in (True, False):
        value = start
        up = first_up
        for _ in range(n - 1):
            if up:
                value += m
            else:
                value -= 1
            best = max(best, value)
            up = not up
    return best
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || ![input.start, input.n, input.m].every(Number.isInteger)) {
    throw new Error('Use an object with integers start, n and m.')
  }
  const { start, n, m } = input
  if (start < 1 || start > 50) throw new Error('start is an integer from 1 to 50 in this visualization.')
  if (n < 1 || n > 12) throw new Error('n is an integer from 1 to 12 in this visualization.')
  if (m < 1 || m > 20) throw new Error('m is an integer from 1 to 20 in this visualization.')
  return { start, n, m }
}

export function buildTrace({ start, n, m }) {
  const frames = []
  let best = start
  frames.push({ pythonLine: P('if n == 1'), phase: 'start', activeLine: L('if n is one'), pattern: null, path: [start], best, message: `Length ${n}, start ${start}, largest step ${m}.` })
  if (n === 1) {
    frames.push({ pythonLine: P('return start'), phase: 'done', activeLine: L('return s'), pattern: null, path: [start], best, message: `A single element can only be ${start}.` })
    return { input: { start, n, m }, result: start, frames }
  }
  for (const firstUp of [true, false]) {
    const pattern = firstUp ? 'up first' : 'down first'
    let value = start
    let up = firstUp
    const path = [start]
    frames.push({ pythonLine: P('for first_up in'), phase: 'pattern', activeLine: L('for each first direction'), pattern, path: [...path], best, message: `Try a sequence that starts ${pattern}.` })
    for (let step = 1; step < n; step++) {
      value = up ? value + m : value - 1
      path.push(value)
      if (value > best) best = value
      frames.push({ pythonLine: P('value += m'), phase: up ? 'up' : 'down', activeLine: L(up ? 'if direction is up' : 'if direction is up'), pattern, path: [...path], best, up,
        message: `${up ? `Up by ${m}` : 'Down by 1'} to ${value}. Best is ${best}.` })
      up = !up
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), pattern: null, path: [], best, message: `The largest element reachable is ${best}.` })
  return { input: { start, n, m }, result: best, frames }
}
