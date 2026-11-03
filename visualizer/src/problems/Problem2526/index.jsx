import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'window: the last k numbers seen; matches: how many equal value',
  'for each number arriving',
  '  append it to the window and count it when it equals value',
  '  if the window is longer than k, drop the oldest and uncount it',
  '  answer is true when the window holds k numbers and all equal value',
].map((text, index) => ({ line: index + 1, text }))

const python = `from collections import deque

def consecutive_stream(value, k, stream):
    window, matches, out = deque(), 0, []
    for num in stream:
        window.append(num)
        if num == value:
            matches += 1
        if len(window) > k and window.popleft() == value:
            matches -= 1
        out.append(len(window) == k and matches == k)
    return out
`

const PY = { window: 4, loop: 5, append: 6, trim: 9, answer: 11, done: 12 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.value) || !Number.isInteger(input.k) || input.k < 1 || input.k > 8) throw new Error('value is an integer and k is from 1 to 8.')
  if (!Array.isArray(input.stream) || input.stream.length < 1 || input.stream.length > 20 || !input.stream.every(Number.isInteger)) throw new Error('stream is 1 to 20 integers.')
  return { value: input.value, k: input.k, stream: input.stream }
}

export function build({ value, k, stream }) {
  const window = []
  let matches = 0
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: 1, pythonLine: PY.window, message: `Watch for ${k} copies of ${value} in a row.`, window: [], matches, out: null })
  stream.forEach((num, index) => {
    window.push(num)
    if (num === value) matches += 1
    frames.push({ phase: 'append', activeLine: 3, pythonLine: PY.append, message: `Number ${num} enters the window.`, window: [...window], matches, out: null })
    if (window.length > k) {
      const old = window.shift()
      if (old === value) matches -= 1
      frames.push({ phase: 'trim', activeLine: 4, pythonLine: PY.trim, message: `Oldest number ${old} leaves the window.`, window: [...window], matches, out: null })
    }
    const answer = window.length === k && matches === k
    results.push(answer)
    frames.push({ phase: 'answer', activeLine: 5, pythonLine: PY.answer, message: `After number ${index + 1}, answer is ${answer}.`, window: [...window], matches, out: answer })
  })
  frames.push({ phase: 'done', activeLine: 5, pythonLine: PY.done, message: 'Every number has been answered.', window: [...window], matches, out: null })
  return { input: { value, k, stream }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'An empty window.' },
    { id: 'append', label: 'Arrive', description: 'A number joins the window.' },
    { id: 'trim', label: 'Leave', description: 'The oldest number drops out.' },
    { id: 'answer', label: 'Answer', description: 'Check the window.' },
    { id: 'done', label: 'Result', description: 'Stream finished.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with value, k and stream (list of integers)',
  url: 'https://leetcode.com/problems/find-consecutive-integers-from-a-data-stream/',
  complexity: 'Each number is added and removed from the window once, so every answer costs constant time and the window holds at most k numbers.',
  examples: [
    { label: 'Example', input: '{"value":7,"k":2,"stream":[7,3,7,7,7,2,7]}' },
  ],
}

export default function ConsecutiveIntegersFromStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Last numbers seen" className="algorithm-workspace__players">
      {step.window.map((num, i) => <li key={i} data-role={num === run.input.value ? 'focus' : ''}>{num}</li>)}
    </ol>
    <output aria-label="Match count">{`Matches of ${run.input.value} in the window: ${step.matches} of ${run.input.k}`}</output>
    {step.out !== null && <p aria-label="Answer">{step.out ? 'true' : 'false'}</p>}
  </>} renderReasoning={() => <>
    <p>The question is only about the last k numbers, so a queue of length k describes everything needed. The count of matches changes by at most one when a number enters or leaves.</p>
  </>} />
}
