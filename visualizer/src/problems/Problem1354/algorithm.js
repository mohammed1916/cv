export function parseInput(text) {
  const data = JSON.parse(text)
  const { target } = data ?? {}
  if (!Array.isArray(target) || target.length < 1 || target.length > 5) throw new Error('Use "target" as an array of 1 to 5 values.')
  if (target.some(v => !Number.isInteger(v) || v < 1 || v > 12)) throw new Error('Each target value is an integer from 1 to 12.')
  return { target }
}

export function buildTrace({ target }) {
  const values = [...target]
  let total = values.reduce((a, b) => a + b, 0)
  const frames = []
  let result
  if (values.length === 1) {
    result = values[0] === 1
    frames.push({ phase: 'single', activeLine: L('one value'), values: [...values], picked: 0, message: 'A single value can only come from a start of [1].' })
  } else {
    for (;;) {
      let at = 0
      for (let i = 1; i < values.length; i++) if (values[i] > values[at]) at = i
      const x = values[at]
      const rest = total - x
      frames.push({ phase: 'undo', activeLine: L('take the largest value'), values: [...values], picked: at, message: `Largest ${x}; the other values sum to ${rest}.` })
      if (x === 1 || rest === 1) { result = true; break }
      if (x <= rest) { result = false; break }
      const next = x % rest
      if (next === 0) { result = false; break }
      values[at] = next
      total = rest + next
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), values: [...values], picked: -1, message: `Answer: ${result}.` })
  return { input: { target }, result, frames }
}

export const code = `can the target be built from ones by replacing a value with the sum of all values
  if the target has one value then return whether that value is 1
  set total to the sum of the target
  repeat
    take the largest value x, and let rest be total minus x
    if x is 1 or rest is 1 then return true
    if x is not larger than rest then return false
    set the value to x modulo rest, and if that is 0 then return false
    set total to rest plus the new value
  end of loop`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def possible_from_ones(target):
    if len(target) == 1:
        return target[0] == 1
    heap = [-v for v in target]
    heapq.heapify(heap)
    total = sum(target)
    while True:
        x = -heapq.heappop(heap)
        rest = total - x
        if x == 1 or rest == 1:
            return True
        if x <= rest:
            return False
        new = x % rest
        if new == 0:
            return False
        heapq.heappush(heap, -new)
        total = rest + new
`
