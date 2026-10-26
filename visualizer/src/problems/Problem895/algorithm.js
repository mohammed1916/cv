export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 2 || !Array.isArray(arr[0]) || !Array.isArray(arr[1]) || arr[0].length !== arr[1].length) {
    throw new Error('Enter LeetCode style JSON: [["FreqStack","push","pop",...], [[],[5],[],...]].')
  }
  const [names, args] = arr
  if (names.length < 2 || names.length > 60) throw new Error('Use between 2 and 60 operations (visualization cap).')
  if (names[0] !== 'FreqStack' || !Array.isArray(args[0]) || args[0].length !== 0) throw new Error('The first operation must be "FreqStack" with no arguments.')
  let size = 0
  const ops = []
  for (let i = 1; i < names.length; i++) {
    if (names[i] === 'push') {
      if (!Array.isArray(args[i]) || args[i].length !== 1 || !Number.isInteger(args[i][0]) || args[i][0] < 0 || args[i][0] > 1000000000) throw new Error(`Operation ${i}: push needs one integer between 0 and 1,000,000,000.`)
      ops.push({ name: 'push', value: args[i][0] })
      size++
    } else if (names[i] === 'pop') {
      if (!Array.isArray(args[i]) || args[i].length !== 0) throw new Error(`Operation ${i}: pop takes no arguments.`)
      if (size === 0) throw new Error(`Operation ${i}: pop on an empty stack is not allowed.`)
      ops.push({ name: 'pop' })
      size--
    } else throw new Error(`Operation ${i}: unknown method "${names[i]}" (use push or pop).`)
  }
  return ops
}

export function buildTrace(ops) {
  const freq = new Map()
  const group = new Map()
  let maxfreq = 0
  const log = []
  const state = () => ({
    freq: [...freq.entries()].filter(([, f]) => f > 0).sort((a, b) => a[0] - b[0]),
    groups: [...group.entries()].sort((a, b) => a[0] - b[0]).map(([f, items]) => [f, [...items]]),
    maxfreq,
  })
  const frames = [{ phase: 'start', current: -1, log: [], ...state(), activeLine: 3, message: 'Track each value\'s frequency, a stack of values per frequency level, and the highest level maxfreq.' }]
  const results = []
  ops.forEach((op, i) => {
    if (op.name === 'push') {
      const f = (freq.get(op.value) ?? 0) + 1
      freq.set(op.value, f)
      const pre = log.concat({ name: 'push', args: [op.value], returned: null })
      frames.push({ phase: 'push', current: i, log: pre, ...state(), activeLine: 8, message: `push(${op.value}): its frequency becomes ${f}.` })
      if (f > maxfreq) maxfreq = f
      if (!group.has(f)) group.set(f, [])
      group.get(f).push(op.value)
      log.push({ name: 'push', args: [op.value], returned: null })
      results.push(null)
      frames.push({ phase: 'place', current: i, log: [...log], ...state(), activeLine: 12, message: `Place ${op.value} on top of the level-${f} stack${f === maxfreq ? ' (maxfreq is now ' + maxfreq + ')' : ''}. Level stacks keep recency: later pushes sit higher.` })
    } else {
      const val = group.get(maxfreq).pop()
      frames.push({ phase: 'pop', current: i, log: log.concat({ name: 'pop', args: [], returned: val }), ...state(), activeLine: 15, message: `pop(): the top of level ${maxfreq} is ${val}. That level only holds values reaching that frequency, and its top is the most recent one.` })
      freq.set(val, freq.get(val) - 1)
      let note = ''
      if (group.get(maxfreq).length === 0) { group.delete(maxfreq); maxfreq -= 1; note = ` Level was emptied, so maxfreq drops to ${maxfreq}.` }
      log.push({ name: 'pop', args: [], returned: val })
      results.push(val)
      frames.push({ phase: 'shrink', current: i, log: [...log], ...state(), activeLine: 17, message: `${val} now has frequency ${freq.get(val)}.${note} Return ${val}.` })
    }
  })
  frames.push({ phase: 'done', current: ops.length - 1, log: [...log], ...state(), activeLine: 19, message: `All operations done. Returned values: [${results.map(r => (r === null ? 'null' : r)).join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `class FreqStack:
    def __init__(self):
        self.freq = {}
        self.group = {}
        self.maxfreq = 0

    def push(self, val):
        f = self.freq.get(val, 0) + 1
        self.freq[val] = f
        if f > self.maxfreq:
            self.maxfreq = f
        self.group.setdefault(f, []).append(val)

    def pop(self):
        val = self.group[self.maxfreq].pop()
        self.freq[val] -= 1
        if not self.group[self.maxfreq]:
            self.maxfreq -= 1
        return val`.split('\n').map((text, index) => ({ line: index + 1, text }))
