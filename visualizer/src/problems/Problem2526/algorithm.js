export const code = `class DataStream(value, k)
  window <- empty queue of the last k numbers
  matches <- 0
function consec(num)
  push num onto window and count it when num equals value
  if window holds more than k numbers
    drop the oldest number and uncount it when it equals value
  RETURN window holds k numbers and matches equals k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `from collections import deque

def consecutive_stream(value, k, stream):
    window, matches, out = deque(), 0, []
    for num in stream:
        window.append(num)
        if num == value:
            matches += 1
        if len(window) > k and window.popleft() == value:
            matches -= 1
        out.append(len(window) == k and matches == k)
    return out
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.value) || !Number.isInteger(input.k) || input.k < 1 || input.k > 8) throw new Error('value is an integer and k is from 1 to 8.')
  if (!Array.isArray(input.stream) || input.stream.length < 1 || input.stream.length > 20 || !input.stream.every(Number.isInteger)) throw new Error('stream is 1 to 20 integers.')
  return { value: input.value, k: input.k, stream: input.stream }
}

export function buildTrace({ value, k, stream }) {
  const window = []
  let matches = 0
  const frames = []
  const results = []
  const frame = (fields) => frames.push({ value, k, stream, window: [...window], matches, out: null, l: window.length ? stream.length && results.length + 1 - window.length : null, r: results.length, ...fields })
  frames.push({ phase: 'start', activeLine: CL('window <-'), pythonLine: PL('window, matches, out'), message: `Watch for ${k} copies of ${value} in a row.`, window: [], matches, l: null, r: -1, out: null })
  stream.forEach((num, index) => {
    window.push(num)
    if (num === value) matches += 1
    frame({ phase: 'append', activeLine: CL('push num'), pythonLine: PL('window.append(num)'), message: `Number ${num} enters the window.`, r: index, l: index - window.length + 1 })
    if (window.length > k) {
      const old = window.shift()
      if (old === value) matches -= 1
      frame({ phase: 'trim', activeLine: CL('drop the oldest'), pythonLine: PL('window.popleft()'), message: `Oldest number ${old} leaves the window.`, r: index, l: index - window.length + 1 })
    }
    const answer = window.length === k && matches === k
    results.push(answer)
    frame({ phase: 'answer', activeLine: CL('RETURN window holds'), pythonLine: PL('out.append'), message: `After number ${index + 1}, the answer is ${answer}.`, r: index, l: index - window.length + 1, out: answer })
  })
  frames.push({ phase: 'done', activeLine: CL('RETURN window'), pythonLine: PL('return out'), message: 'Every number has been answered.', window: [...window], matches, l: null, r: -1, out: null })
  return { input: { value, k, stream }, result: results, frames }
}
