export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, logs } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n must be an integer from 1 to 100.')
  if (!Array.isArray(logs) || logs.length < 1 || logs.length > 500) throw new Error('logs must be a list of 1–500 entries.')
  const parsed = logs.map(entry => {
    const m = /^(\d+):(start|end):(\d+)$/.exec(entry)
    if (!m) throw new Error(`Malformed log entry: ${entry}`)
    return { id: Number(m[1]), kind: m[2], time: Number(m[3]) }
  })
  if (parsed.some(p => p.id >= n)) throw new Error('Function ids must be below n.')
  if (parsed.some(p => p.time > 1000000)) throw new Error('Timestamps must be at most 1,000,000.')
  return { n, logs: parsed }
}

// Each tick belongs to the function on top of the stack. A start charges the time since `previous`
// to the caller; an end charges through its own tick (inclusive), then the next tick starts after it.
export function buildTrace({ n, logs }) {
  const result = Array(n).fill(0)
  const stack = []
  let previous = 0
  const frames = [{ phase: 'start', stack: [], result: [...result], activeLine: L('const result = Array'), pythonLine: P('res = [0] * n'), message: 'Keep a stack of running functions; charge elapsed time to the top.' }]
  for (const log of logs) {
    if (log.kind === 'start') {
      if (stack.length) result[stack[stack.length - 1]] += log.time - previous
      stack.push(log.id)
      frames.push({ phase: 'start', stack: [...stack], result: [...result], current: log.id, activeLine: L('stack.push(id)'), pythonLine: P('stack.append(fid)'), message: `Function ${log.id} starts at ${log.time}; it becomes the top.` })
      previous = log.time
    } else {
      result[stack[stack.length - 1]] += log.time - previous + 1
      stack.pop()
      frames.push({ phase: 'end', stack: [...stack], result: [...result], current: log.id, activeLine: L('stack.pop()'), pythonLine: P('prev = time + 1'), message: `Function ${log.id} ends at ${log.time}; it ran through ${log.time}.` })
      previous = log.time + 1
    }
  }
  frames.push({ phase: 'done', stack: [], result: [...result], activeLine: L('return result'), pythonLine: P('return res'), message: 'Exclusive times are complete.' })
  return { input: { n, logs }, result, frames }
}

const SOURCE = `function exclusiveTime(n, logs) {
  const result = Array(n).fill(0)
  const stack = []
  let previous = 0
  for (const { id, kind, time } of logs) {
    if (kind === 'start') {
      if (stack.length) result[stack[stack.length - 1]] += time - previous
      stack.push(id)
      previous = time
    } else {
      result[stack[stack.length - 1]] += time - previous + 1
      stack.pop()
      previous = time + 1
    }
  }
  return result
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def exclusive_time(n, logs):
    res = [0] * n
    stack = []
    prev = 0
    for entry in logs:
        fid_text, kind, time_text = entry.split(':')
        fid, time = int(fid_text), int(time_text)
        if kind == 'start':
            if stack:
                res[stack[-1]] += time - prev
            stack.append(fid)
            prev = time
        else:
            res[stack[-1]] += time - prev + 1
            stack.pop()
            prev = time + 1
    return res`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
