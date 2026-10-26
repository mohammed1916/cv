export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 2 || !Array.isArray(arr[0]) || !Array.isArray(arr[1]) || arr[0].length !== arr[1].length) {
    throw new Error('Enter LeetCode style JSON: [["RLEIterator","next",...], [[[3,8,0,9,2,5]],[2],...]].')
  }
  const [names, args] = arr
  if (names.length < 2 || names.length > 40) throw new Error('Use between 2 and 40 operations (visualization cap).')
  const enc = Array.isArray(args[0]) && args[0].length === 1 ? args[0][0] : null
  if (names[0] !== 'RLEIterator' || !Array.isArray(enc)) throw new Error('The first operation must be "RLEIterator" with one argument: the encoding array.')
  if (enc.length < 2 || enc.length > 40 || enc.length % 2 !== 0 || enc.some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) {
    throw new Error('The encoding must be an even-length array of 2–40 integers between 0 and 1,000,000,000 (count, value pairs).')
  }
  const ops = []
  for (let i = 1; i < names.length; i++) {
    if (names[i] !== 'next') throw new Error(`Operation ${i}: unknown method "${names[i]}" (use next).`)
    if (!Array.isArray(args[i]) || args[i].length !== 1 || !Number.isInteger(args[i][0]) || args[i][0] < 1 || args[i][0] > 1000000000) throw new Error(`Operation ${i}: next needs one integer between 1 and 1,000,000,000.`)
    ops.push(args[i][0])
  }
  return { encoding: [...enc], ops }
}

export function buildTrace({ encoding, ops }) {
  const enc = [...encoding]
  let i = 0
  const log = []
  const results = []
  const frames = [{ phase: 'start', enc: [...enc], i, n: null, current: -1, log: [], activeLine: 3, message: 'Store the encoding and a pointer i at the first run (count at even index, value at odd index).' }]
  ops.forEach((n0, k) => {
    let n = n0
    frames.push({ phase: 'next', enc: [...enc], i, n, current: k, log: log.concat({ name: 'next', args: [n0] }), activeLine: 6, message: `next(${n0}): we must skip ${n0} element(s) and report the last one skipped.` })
    while (i < enc.length && enc[i] < n) {
      frames.push({ phase: 'skip', enc: [...enc], i, n, current: k, log: log.concat({ name: 'next', args: [n0] }), activeLine: 7, message: `Run at ${i} has ${enc[i]} copies of ${enc[i + 1]}, and ${enc[i]} < ${n}, so the whole run is consumed and the target is further on (n becomes ${n - enc[i]}).` })
      n -= enc[i]
      i += 2
    }
    let returned
    if (i >= enc.length) {
      returned = -1
      results.push(-1)
      log.push({ name: 'next', args: [n0], returned })
      frames.push({ phase: 'exhaust', enc: [...enc], i, n, current: k, log: [...log], activeLine: 10, message: `Every run is used up before ${n0} elements were skipped: return -1.` })
    } else {
      enc[i] -= n
      returned = enc[i + 1]
      results.push(returned)
      log.push({ name: 'next', args: [n0], returned })
      frames.push({ phase: 'take', enc: [...enc], i, n, current: k, log: [...log], activeLine: 12, message: `The run at ${i} has at least the remaining ${n}: remove ${n} copies (count becomes ${enc[i]}) and return its value ${returned}.` })
    }
  })
  frames.push({ phase: 'done', enc: [...enc], i, n: null, current: ops.length - 1, log: [...log], activeLine: 13, message: `Results: [${results.join(', ')}].` })
  return { input: { encoding, ops }, result: results, frames }
}

export const code = `class RLEIterator:
    def __init__(self, encoding):
        self.enc = encoding
        self.i = 0

    def next(self, n):
        while self.i < len(self.enc) and self.enc[self.i] < n:
            n -= self.enc[self.i]
            self.i += 2
        if self.i >= len(self.enc):
            return -1
        self.enc[self.i] -= n
        return self.enc[self.i + 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
