// Own wording and sample data. The run stack follows the Python solution in `python`.
export const phases = [
  { id: 'read', label: 'Read', description: 'Take the next character from the string.' },
  { id: 'push', label: 'Extend or push', description: 'Grow the top run when it has the same character, otherwise start a new run.' },
  { id: 'remove', label: 'Remove full run', description: 'When the top run reaches k characters, delete it so the run beneath can meet later characters.' },
  { id: 'done', label: 'Result', description: 'Join the surviving runs in order.' },
]

export const inputLabel = 'Object with s (lowercase letters) and k (JSON)'
export const complexity = 'O(n) time and O(n) space. Each character is pushed once and each run is removed at most once. The visualizer caps s at 30 characters.'
export const examples = [
  { label: 'Cascade', input: '{"s":"pqqqrrrpz","k":3}' },
  { label: 'Complete removal', input: '{"s":"aaabbb","k":3}' },
  { label: 'No long run', input: '{"s":"cedar","k":2}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (typeof data.s !== 'string' || !/^[a-z]{1,30}$/.test(data.s)) throw new Error('s must be 1 to 30 lowercase letters.')
  if (!Number.isInteger(data.k) || data.k < 2 || data.k > 5) throw new Error('k must be an integer from 2 to 5.')
  return { s: data.s, k: data.k }
}

const codeText = `remove_runs(s, k):
  stack = empty list of runs, each run is (character, length)
  for each character ch in s:
    if the top run has character ch:
      add 1 to the top run's length
    else:
      push a new run (ch, 1)
    if the top run's length equals k:
      pop the top run
  return every run's character repeated by its length, in order`
const pythonText = `def remove_runs(s, k):
    stack = []                              # pairs [character, run length]
    for ch in s:
        if stack and stack[-1][0] == ch:
            stack[-1][1] += 1
        else:
            stack.append([ch, 1])
        if stack[-1][1] == k:
            stack.pop()
    return "".join(ch * n for ch, n in stack)`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

export function buildTrace({ s, k }) {
  const stack = []
  const frames = []
  const snap = (extra = {}) => ({ stack: stack.map(([ch, n]) => ({ ch, n })), ...extra })
  frames.push({
    phase: 'read', activeLine: L('stack = empty'), pythonLine: P('stack = []'),
    message: `Start with an empty stack. A run is removed as soon as it reaches ${k} equal characters.`,
    snapshot: snap({ index: -1 }),
  })
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    frames.push({
      phase: 'read', activeLine: L('for each character'), pythonLine: P('for ch in s'),
      message: `Read "${ch}" at position ${i}.`, snapshot: snap({ index: i }),
    })
    const top = stack[stack.length - 1]
    if (top && top[0] === ch) {
      top[1] += 1
      frames.push({
        phase: 'push', activeLine: L('add 1 to the top'), pythonLine: P('stack[-1][1] += 1'),
        message: `The top run is also "${ch}", so it grows to ${top[1]}.`, snapshot: snap({ index: i }),
      })
    } else {
      stack.push([ch, 1])
      frames.push({
        phase: 'push', activeLine: L('push a new run'), pythonLine: P('stack.append'),
        message: `"${ch}" does not match the top run, so it starts a new run of length 1.`, snapshot: snap({ index: i }),
      })
    }
    const current = stack[stack.length - 1]
    if (current[1] === k) {
      stack.pop()
      frames.push({
        phase: 'remove', activeLine: L('pop the top run'), pythonLine: P('stack.pop()'),
        message: `The run of "${current[0]}" reached ${k}, so it is removed. The run beneath it now meets whatever comes next.`,
        snapshot: snap({ index: i, removed: current[0] }),
      })
    }
  }
  const result = stack.map(([ch, n]) => ch.repeat(n)).join('')
  frames.push({
    phase: 'done', activeLine: L('return every run'), pythonLine: P('return "".join'),
    message: result ? `The surviving runs, in order, give "${result}".` : 'Every character was removed, so the answer is the empty string.',
    snapshot: snap({ index: s.length }),
  })
  return { input: { s, k }, result, frames }
}
