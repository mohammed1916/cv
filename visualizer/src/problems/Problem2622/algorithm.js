export const code = [
  'store entries in a map from key to value and expiry',
  'for each operation in time order',
  'if set: check whether the key is alive at this time',
  'store the value with expiry at time plus duration',
  'if get: return the value when alive otherwise -1',
  'if count: count the keys still alive',
  'return the results',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

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
    step(frames, 'op', 'for each operation', `At time ${time}: ${op}.`, view(i, time))
    if (op === 'set') {
      const existed = alive(key, time)
      step(frames, 'set', 'if set:', existed ? `${key} is still alive, so it is overwritten and the answer is true.` : `${key} is new or expired, so the answer is false.`, view(i, time))
      store.set(key, { value, expires: time + duration })
      results.push(existed)
      step(frames, 'set', 'store the value', `${key} now expires at ${time + duration}.`, view(i, time))
    } else if (op === 'get') {
      const found = alive(key, time) ? store.get(key).value : -1
      results.push(found)
      step(frames, 'get', 'if get:', `get ${key} gives ${found}.`, view(i, time))
    } else {
      const count = [...store.keys()].filter(k => alive(k, time)).length
      results.push(count)
      step(frames, 'count', 'if count:', `${count} keys are alive at time ${time}.`, view(i, time))
    }
  }
  step(frames, 'done', 'return the results', 'All operations answered.', view(-1))
  return { result: results, frames }
}
