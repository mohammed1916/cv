import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `repeat text a given number of times
  result = empty string
  repeat count times
    append text to result
  return result`
const python = `def repeat_string(text, times):
    result = ""
    for _ in range(times):
        result += text
    return result`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.str !== 'string' || !Number.isInteger(input.times) || input.times < 0) {
    throw new Error('Use { "str": "...", "times": n } with n a non-negative integer.')
  }
  return input
}

function buildTrace({ str, times }) {
  const chunks = []
  const frames = [{ phase: 'start', activeLine: 2, message: `Repeat "${str}" ${times} time(s).`, at: -1, out: [] }]
  for (let k = 0; k < times; k++) {
    chunks.push(str)
    frames.push({ phase: 'step', activeLine: 4, message: `Append copy ${k + 1}.`, at: k, out: [...chunks] })
  }
  frames.push({ phase: 'done', activeLine: 5, message: `Result: "${chunks.join('')}".`, at: -1, out: [...chunks] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Nothing appended yet.' },
    { id: 'step', label: 'Append', description: 'Add one more copy.' },
    { id: 'done', label: 'Result', description: 'All copies are joined.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with str and a non-negative integer times',
  url: 'https://leetcode.com/problems/repeat-string/',
  complexity: 'O(n * times) with repeated concatenation, where n is the length of the text.',
  examples: [
    { label: 'Three copies', input: '{"str":"ab","times":3}' },
    { label: 'Zero copies', input: '{"str":"xyz","times":0}' },
  ],
}

export default function RepeatString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Copies appended" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
    <output aria-label="Joined result">{`Joined: "${step.out.join('')}"`}</output>
  </>} renderReasoning={() => <>
    <p>Each copy is a fixed block. The loop keeps a count and appends one block per pass.</p>
    <p>The count is the only thing that decides how long the result becomes.</p>
  </>} />
}
