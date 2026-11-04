const CODE = [
  'function timeLimit(fn, t) {',
  '  return async function (...args) {',
  '    const work = fn(...args)',
  '    const limit = new Promise((_, reject) => setTimeout(() => reject("Time Limit Exceeded"), t))',
  '    return Promise.race([work, limit])',
  '  }',
  '}',
]

const PY = [
  'def time_limit(fn, t):',
  '    async def limited(*args):',
  '        try:',
  '            return await asyncio.wait_for(fn(*args), timeout=t / 1000)',
  '        except asyncio.TimeoutError:',
  '            raise Exception("Time Limit Exceeded")',
  '    return limited',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Start the task and the limit timer together.' },
  { id: 'wait', label: 'Wait', description: 'Neither has settled yet.' },
  { id: 'resolve', label: 'Resolve', description: 'The task wins the race.' },
  { id: 'reject', label: 'Reject', description: 'The limit wins the race.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with delay, limit and value.')
  const { delay, limit, value } = input
  if (!Number.isInteger(delay) || delay < 0 || delay > 500) throw new Error('delay is an integer from 0 to 500.')
  if (!Number.isInteger(limit) || limit < 0 || limit > 500) throw new Error('limit is an integer from 0 to 500.')
  if (typeof value !== 'string' || value.length > 20) throw new Error('value is a string of at most 20 characters.')
  return { delay, limit, value }
}

export function buildTrace({ delay, limit, value }) {
  const frames = []
  const end = Math.min(delay, limit)
  frames.push({ pythonLine: at(PY, 'return await asyncio.wait_for(fn(*args), timeout=t / 1000)'), activeLine: at(CODE, 'const work = fn(...args)'), phase: 'start', t: 0, outcome: null, message: 'Start the task and the limit timer together.' })
  for (let t = 10; t < end; t += 10) frames.push({ pythonLine: at(PY, 'return await asyncio.wait_for(fn(*args), timeout=t / 1000)'), activeLine: at(CODE, 'return Promise.race([work, limit])'), phase: 'wait', t, outcome: null, message: `At ${t} ms neither has settled.` })
  const ok = delay <= limit
  frames.push({
    pythonLine: at(PY, ok ? 'return await asyncio.wait_for(fn(*args), timeout=t / 1000)' : 'raise Exception("Time Limit Exceeded")'),
    activeLine: at(CODE, ok ? 'return Promise.race([work, limit])' : 'const limit = new Promise((_, reject) => setTimeout(() => reject("Time Limit Exceeded"), t))'),
    phase: ok ? 'resolve' : 'reject', t: end,
    outcome: ok ? 'resolved' : 'rejected',
    message: ok ? `The task finishes at ${delay} ms, before the limit, so it resolves with "${value}".` : `The limit fires at ${limit} ms first, so the promise rejects.`,
  })
  for (const frame of frames) { frame.delay = delay; frame.limit = limit }
  return { input: { delay, limit, value }, result: ok ? value : 'Time Limit Exceeded', frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
