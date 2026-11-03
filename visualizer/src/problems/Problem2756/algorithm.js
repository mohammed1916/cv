const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'JSON array of tasks: {id, ms, fail?} with ms from 0 to 1000 (up to 8)'
export const URL = 'https://leetcode.com/problems/parallel-execution-of-promises-for-individual-results-retrieval/'
export const COMPLEXITY = 'O(n log n) to order the simulated finish times. Every task is kept, so no early exit happens.'
export const EXAMPLES = [
  { label: 'Mixed', input: '[{"id":"a","ms":30},{"id":"b","ms":10,"fail":true},{"id":"c","ms":20}]' },
  { label: 'All succeed', input: '[{"id":"x","ms":5},{"id":"y","ms":1}]' },
]
export const WHY = [
  'Unlike a version that stops at the first rejection, every task is allowed to finish and report its own outcome.',
  'Each slot records either a fulfilled value or a rejected reason, so the caller can inspect each result separately.',
  'Results keep input order: slot i always describes task i, whatever the finish order was.',
]
export function parseInput(text) {
  const tasks = JSON.parse(text)
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 8) throw new Error('Use a list of 1 to 8 tasks.')
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || !Number.isInteger(task.ms) || task.ms < 0 || task.ms > 1000) throw new Error('Each task needs a string id and an integer ms from 0 to 1000.')
  }
  return tasks
}
export function buildTrace(tasks) {
  const frames = [frame('setup', 1, `Start all ${tasks.length} tasks; none is awaited in order.`, { started: tasks.map(t => t.id) })]
  const results = new Array(tasks.length).fill(null)
  const order = tasks.map((task, index) => ({ task, index })).sort((x, y) => x.task.ms - y.task.ms || x.index - y.index)
  for (const { task, index } of order) {
    results[index] = task.fail
      ? { status: 'rejected', reason: task.id }
      : { status: 'fulfilled', value: `${task.id}-done` }
    frames.push(frame('step', 3, `Task ${task.id} ${task.fail ? 'rejects' : 'fulfils'} at ${task.ms}ms; record it in slot ${index}.`, { time: task.ms, results: results.map(r => r && r.status) }))
  }
  frames.push(frame('done', 5, 'Every task is recorded; results keep input order.', { results }))
  return { input: tasks, result: results, frames }
}
export const code = lines(`start every task now
create a results list with one slot per task
for each task in the order they finish
  record fulfilled with its value, or rejected with its reason, in its slot
return the list of records`)
export const python = `def settle_all(tasks):
    results = [None] * len(tasks)
    for index, task in sorted(enumerate(tasks), key=lambda p: p[1].ms):
        results[index] = task.outcome()
    return results`
