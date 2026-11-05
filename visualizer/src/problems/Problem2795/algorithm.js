const JS = [
  'function runAll(tasks) {',
  '  const results = new Array(tasks.length)',
  '  let left = tasks.length',
  '  return new Promise((resolve, reject) => {',
  '    tasks.forEach((task, i) => {',
  '      task.then(value => {',
  '        results[i] = value',
  '        left -= 1',
  '        if (left === 0) resolve(results)',
  '      }, reject)',
  '    })',
  '  })',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `import asyncio

async def run_all(tasks):
    async def run(i, task):
        return i, await task
    results = [None] * len(tasks)
    for finished in asyncio.as_completed([run(i, t) for i, t in enumerate(tasks)]):
        i, value = await finished
        results[i] = value
    return results`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.tasks) || input.tasks.some(t => !t || typeof t.delay !== 'number' || t.delay < 0)) {
    throw new Error('Use { "tasks": [{ "value": ..., "delay": ms }, ...] } with non-negative delays.')
  }
  return { tasks: input.tasks.map(t => ({ value: t.value, delay: t.delay })) }
}

export function buildTrace({ tasks }) {
  const results = Array(tasks.length).fill(null)
  const frames = [{ phase: 'start', activeLine: L('new Array'), pythonLine: P('results = [None]'), message: `Start ${tasks.length} task(s) together. Nothing has finished yet.`, at: -1, out: [...results] }]
  const order = tasks.map((t, i) => i).sort((a, b) => tasks[a].delay - tasks[b].delay || a - b)
  for (const i of order) {
    results[i] = tasks[i].value
    frames.push({ phase: 'step', activeLine: L('results[i] = value'), pythonLine: P('results[i] = value'), message: `Task ${i} finishes at ${tasks[i].delay} ms and fills slot ${i}.`, at: i, out: results.map(v => v ?? '…') })
  }
  frames.push({ phase: 'done', activeLine: L('resolve(results)'), pythonLine: P('return results'), message: 'Every slot is filled, so the promise resolves with results in input order.', at: -1, out: results.map(v => v ?? '…') })
  return { input: { tasks }, result: results, frames }
}
