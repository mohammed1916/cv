export const code = [
  'class TimeLimitedCache {',
  '  constructor() { this.store = new Map() }',
  '  // for (const op of ops) dispatches each operation in time order',
  '  set(key, value, duration, time) {',
  '    const alive = this.store.has(key) && this.store.get(key).expires > time',
  '    this.store.set(key, { value, expires: time + duration })',
  '    return alive',
  '  }',
  '  get(key, time) {',
  '    return this.store.has(key) && this.store.get(key).expires > time ? this.store.get(key).value : -1',
  '  }',
  '  count(time) {',
  '    return [...this.store.keys()].filter(k => this.store.get(k).expires > time).length',
  '  }',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `class TimeLimitedCache:
    def __init__(self):
        self.store = {}
    # for op in ops dispatches each operation in time order

    def set(self, key, value, duration, time):
        alive = key in self.store and self.store[key][1] > time
        self.store[key] = (value, time + duration)
        return alive

    def get(self, key, time):
        if key in self.store and self.store[key][1] > time:
            return self.store[key][0]
        return -1

    def count(self, time):
        return sum(1 for _, expires in self.store.values() if expires > time)`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1
function step(frames, phase, line, pyLine, message, view) { frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 10) throw new Error('ops has 1 to 10 operations.')
  let previous = 0
  for (const op of input.ops) {
    if (!Array.isArray(op) || !Number.isInteger(op[0]) || op[0] < previous) throw new Error('Each operation starts with a whole time that never decreases.')
    previous = op[0]
    if (op[1] === 'set') {
      if (op.length !== 5 || typeof op[2] !== 'string' || !Number.isInteger(op[3]) || !Number.isInteger(op[4]) || op[4] < 1) throw new Error('set is [time, "set", key, value, duration].')
    } else if (op[1] === 'get') {
      if (op.length !== 3 || typeof op[2] !== 'string') throw new Error('get is [time, "get", key].')
    } else if (op[1] === 'count') {
      if (op.length !== 2) throw new Error('count is [time, "count"].')
    } else throw new Error('Operations are set, get or count.')
  }
  return { ops: input.ops }
}

export function buildTrace({ ops }) {
  const frames = []
  const store = new Map()
  const results = []
  const alive = (key, time) => store.has(key) && store.get(key).expires > time
  const view = (focus, time = -1) => ({ title: 'Operations', rows: ops.map(op => op.join(' ')), focus, time, store: [...store.entries()].map(([key, entry]) => ({ key, value: entry.value, expires: entry.expires })), results: results.slice(), summary: `results so far: ${JSON.stringify(results)}` })
  for (let i = 0; i < ops.length; i++) {
    const [time, op, key, value, duration] = ops[i]
    step(frames, 'op', 'for (const op of ops)', 'for op in ops', `At time ${time}: ${op}.`, view(i, time))
    if (op === 'set') {
      const existed = alive(key, time)
      step(frames, 'set', 'const alive = this.store.has', 'alive = key in self.store', existed ? `${key} is still alive, so it is overwritten and the answer is true.` : `${key} is new or expired, so the answer is false.`, view(i, time))
      store.set(key, { value, expires: time + duration })
      results.push(existed)
      step(frames, 'set', 'this.store.set(key, { value', 'self.store[key] = (value', `${key} now expires at ${time + duration}.`, view(i, time))
    } else if (op === 'get') {
      const found = alive(key, time) ? store.get(key).value : -1
      results.push(found)
      step(frames, 'get', 'return this.store.has(key) && this.store.get(key).expires > time ?', 'if key in self.store and self.store[key][1] > time', `get ${key} gives ${found}.`, view(i, time))
    } else {
      const count = [...store.keys()].filter(k => alive(k, time)).length
      results.push(count)
      step(frames, 'count', 'return [...this.store.keys()]', 'return sum(1 for', `${count} keys are alive at time ${time}.`, view(i, time))
    }
  }
  step(frames, 'done', 'return [...this.store.keys()]', 'return sum(1 for', 'All operations answered.', view(-1))
  return { result: results, frames }
}
