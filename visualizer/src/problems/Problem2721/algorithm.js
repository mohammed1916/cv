const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
// JavaScript line numbers in code; pythonLine maps each to the matching Python line.
const PY_OF = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 6, 6: 7 }
const frame = (phase, line, message, state = {}) => ({ phase, pythonLine: PY_OF[line] ?? line, activeLine: line, message, state })
export const PHASES = [
  { id: 'setup', label: 'Setup', description: 'Read the input and prepare the model.' },
  { id: 'step', label: 'Step', description: 'Process one event or item.' },
  { id: 'done', label: 'Result', description: 'The final value.' },
]
export const INPUT_LABEL = 'JSON array of tasks: {id, ms, fail?} with ms from 0 to 1000'
export const URL = 'https://leetcode.com/problems/execute-asynchronous-functions-in-parallel/'
export const COMPLEXITY = 'O(n log n) to order the simulated finish times. Each task starts once and the results array keeps input order.'
export const EXAMPLES = [
  { label: 'All succeed', input: '[{"id":"a","ms":30},{"id":"b","ms":10},{"id":"c","ms":20}]' },
  { label: 'One rejects', input: '[{"id":"a","ms":30},{"id":"b","ms":10,"fail":true},{"id":"c","ms":5}]' },
  { label: 'One task', input: '[{"id":"solo","ms":0}]' },
  { label: 'Equal delays', input: '[{"id":"a","ms":20},{"id":"b","ms":20}]' },
  { label: 'Longest and shortest', input: '[{"id":"a","ms":1000},{"id":"b","ms":999}]' },
  { label: 'Long run: 8 tasks', input: '[{"id":"a","ms":715},{"id":"b","ms":547},{"id":"c","ms":69},{"id":"d","ms":902},{"id":"e","ms":424},{"id":"f","ms":256},{"id":"g","ms":779},{"id":"h","ms":611}]' },
]
export const WHY = [
  'Every task is started before any result is read, so the tasks overlap in time.',
  'Each finished value goes into the slot of its own index, so the output order follows the input order, not the finish order.',
  'The first rejection decides the outcome: the combined call rejects with that reason and ignores anything that finishes later.',
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
  const frames = [frame('setup', 1, `Start all ${tasks.length} tasks at once.`, { started: tasks.map(t => t.id) })]
  const values = new Array(tasks.length).fill(null)
  const order = tasks.map((task, index) => ({ task, index })).sort((x, y) => x.task.ms - y.task.ms || x.index - y.index)
  let remaining = tasks.length
  for (const { task, index } of order) {
    if (task.fail) {
      frames.push(frame('step', 4, `Task ${task.id} rejects at ${task.ms}ms, so the whole call rejects.`, { time: task.ms, rejected: task.id }))
      frames.push(frame('done', 6, 'Rejected. Later finishes are ignored.', { values }))
      return { input: tasks, result: { ok: false, error: task.id }, frames }
    }
    values[index] = `${task.id}-done`
    remaining--
    frames.push(frame('step', 3, `Task ${task.id} finishes at ${task.ms}ms and fills slot ${index}.`, { time: task.ms, values: [...values], remaining }))
  }
  frames.push(frame('done', 6, 'All tasks finished. Values keep input order.', { values }))
  return { input: tasks, result: { ok: true, values }, frames }
}
export const code = lines(`const promises = tasks.map(task => task.run()); // start every task now
const results = new Array(tasks.length); // create a results list with one empty slot per task
for (const { index, task } of byFinish(tasks)) { // for each task in the order they finish
  if (task.fail) throw task.id; // if the task rejects then reject the whole call
  results[index] = task.value; // store its value in its own slot
} return results; // when all slots are filled resolve with the list`)
export const python = `def run_all(tasks):
    results = [None] * len(tasks)
    for index, task in sorted(enumerate(tasks), key=lambda p: p[1].ms):
        if task.fail:
            raise task.id
        results[index] = task.value
    return results`
