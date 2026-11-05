const JS = [
  'function delayResolve(value, ms) {',
  '  return new Promise(resolve => {',
  '    setTimeout(() => resolve(value), ms)',
  '  })',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `import asyncio

async def delay_resolve(value, ms):
    await asyncio.sleep(ms / 1000)
    return value`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.ms) || input.ms < 0 || !('value' in input)) {
    throw new Error('Use { "value": any JSON value, "ms": non-negative integer }.')
  }
  return { value: input.value, ms: input.ms }
}

export function buildTrace({ value, ms }) {
  const frames = [
    { phase: 'start', activeLine: L('return new Promise'), pythonLine: P('async def'), message: `Create a pending promise and start a ${ms} ms timer.`, clock: 0, ms, state: 'pending', out: ['pending'] },
    { phase: 'wait', activeLine: L('setTimeout'), pythonLine: P('await asyncio.sleep'), message: `Nothing can read the value yet. The clock must reach ${ms} ms.`, clock: Math.floor(ms / 2), ms, state: 'pending', out: ['pending'] },
    { phase: 'resolve', activeLine: L('resolve(value)'), pythonLine: P('return value'), message: `At ${ms} ms the timer fires and resolves with ${JSON.stringify(value)}.`, clock: ms, ms, state: 'resolved', out: [JSON.stringify(value)] },
  ]
  return { input: { value, ms }, result: value, frames }
}
