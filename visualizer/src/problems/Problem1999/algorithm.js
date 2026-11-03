const CAP = 2147483647

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with k, digit1 and digit2.')
  const { k, digit1, digit2 } = input
  if (!Number.isInteger(k) || k < 1 || k > 1000000) throw new Error('k is a positive integer up to 1000000 in this visualization.')
  for (const d of [digit1, digit2]) {
    if (!Number.isInteger(d) || d < 0 || d > 9) throw new Error('Each digit is an integer from 0 to 9.')
  }
  return { k, digit1, digit2 }
}

export function buildTrace({ k, digit1, digit2 }) {
  const digits = [...new Set([digit1, digit2])].sort((a, b) => a - b)
  const frames = []
  const queue = digits.filter(d => d !== 0)
  frames.push({
    pythonLine: P('digits = sorted'), phase: 'start', activeLine: L('set digits to'),
    current: null, rem: null, children: [], queue: [...queue], answer: null,
    message: `Allowed digits are ${digits.join(' and ')}. Start the queue with the nonzero digits in ascending order.`,
  })
  if (queue.length === 0) {
    frames.push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), current: null, rem: null, children: [], queue: [], answer: -1, message: 'Only zero is allowed, and a positive number cannot be made of zeros.' })
    return { input: { k, digit1, digit2 }, result: -1, frames }
  }
  while (queue.length) {
    const v = queue.shift()
    frames.push({
      pythonLine: P('v = queue.popleft()'), phase: 'pop', activeLine: L('take the front number'),
      current: v, rem: null, children: [], queue: [...queue], answer: null,
      message: `Take ${v} from the front. Every number still in the queue is larger than ${v}.`,
    })
    const rem = v % k
    const ok = v > k && rem === 0
    frames.push({
      pythonLine: P('if v > k and v % k == 0'), phase: 'check', activeLine: L('if v is greater than k'),
      current: v, rem, children: [], queue: [...queue], answer: ok ? v : null,
      message: ok ? `${v} is above ${k} and ${v} mod ${k} = 0. It is the answer.` : `${v} mod ${k} = ${rem}${v > k ? '' : `, and ${v} is not above ${k}`}. Keep searching.`,
    })
    if (ok) {
      frames.push({ pythonLine: P('return v'), phase: 'found', activeLine: L('return v'), current: v, rem, children: [], queue: [...queue], answer: v, message: `The smallest such number is ${v}.` })
      return { input: { k, digit1, digit2 }, result: v, frames }
    }
    const children = []
    for (const d of digits) {
      const next = v * 10 + d
      if (next <= CAP) { children.push(next); queue.push(next) }
    }
    frames.push({
      pythonLine: P('queue.append(nxt)'), phase: 'extend', activeLine: L('v times 10 plus d'),
      current: v, rem, children: [...children], queue: [...queue], answer: null,
      message: children.length ? `Append each allowed digit: ${children.join(', ')} join the back of the queue.` : `Appending a digit would pass ${CAP}, so nothing joins the queue.`,
    })
  }
  frames.push({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), current: null, rem: null, children: [], queue: [], answer: -1, message: `Every number up to ${CAP} has been tried, and none is a multiple of ${k} above ${k}.` })
  return { input: { k, digit1, digit2 }, result: -1, frames }
}

export const code = `smallest multiple of k above k that uses only the two digits
  set digits to the distinct allowed digits in ascending order
  if no digit is nonzero then return -1
  set the queue to the nonzero digits in ascending order
  while the queue is not empty
    take the front number v
    if v is greater than k and v mod k equals 0 then return v
    for each allowed digit d in ascending order
      if v times 10 plus d is within the cap then append it to the queue
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `from collections import deque

def smallest_greater_multiple(k, digit1, digit2):
    cap = 2147483647
    digits = sorted({digit1, digit2})
    queue = deque(d for d in digits if d != 0)
    while queue:
        v = queue.popleft()
        if v > k and v % k == 0:
            return v
        for d in digits:
            nxt = v * 10 + d
            if nxt <= cap:
                queue.append(nxt)
    return -1
`
const pyLines = python.split('\n')
function P(s) {
  const i = pyLines.findIndex(c => c.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
