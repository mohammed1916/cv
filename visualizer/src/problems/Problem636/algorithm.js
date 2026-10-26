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

export function buildTrace({ n, logs }) {
  const result = Array(n).fill(0)
  const stack = []
  let previous = 0
  const frames = [{ phase: 'start', stack: [], result: [...result], activeLine: 2, message: `Keep a stack of running functions; charge elapsed time to the top.` }]
  for (const log of logs) {
    if (log.kind === 'start') {
      if (stack.length) result[stack[stack.length - 1]] += log.time - previous
      stack.push(log.id)
      frames.push({ phase: 'start', stack: [...stack], result: [...result], current: log.id, activeLine: 5, message: `Function ${log.id} starts at ${log.time}; it becomes the top.` })
    } else {
      result[stack[stack.length - 1]] += log.time - previous + 1
      stack.pop()
      frames.push({ phase: 'end', stack: [...stack], result: [...result], current: log.id, activeLine: 8, message: `Function ${log.id} ends at ${log.time}; it ran through ${log.time}.` })
    }
    previous = log.kind === 'start' ? log.time : log.time + 1
  }
  frames.push({ phase: 'done', stack: [], result: [...result], activeLine: 10, message: 'Exclusive times are complete.' })
  return { input: { n, logs }, result, frames }
}

export const code = `def exclusiveTime(n, logs):
    res, stack, prev = [0] * n, [], 0
    for log in logs:
        fid, kind, time = parse(log)
        if kind == 'start':
            if stack: res[stack[-1]] += time - prev
            stack.append(fid); prev = time
        else:
            res[stack.pop()] += time - prev + 1; prev = time + 1
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
