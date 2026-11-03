import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = [
  'uploaded: set of video numbers; prefix = 0',
  'upload(v): add v to uploaded',
  'longest(): while prefix + 1 is uploaded, advance prefix',
  'return prefix',
].map((text, index) => ({ line: index + 1, text }))

const python = `def longest_prefix(n, ops):
    uploaded, prefix, out = set(), 0, []
    for op in ops:
        if op[0] == "upload":
            uploaded.add(op[1])
        else:
            while prefix + 1 in uploaded:
                prefix += 1
            out.append(prefix)
    return out
`

const PY = { setup: 2, upload: 5, longest: 7, advance: 8, answer: 9, done: 10 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Array.isArray(input.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  input.ops.forEach(op => {
    if (op[0] === 'upload' && (!Number.isInteger(op[1]) || op[1] < 1 || op[1] > input.n)) throw new Error('upload needs a video number from 1 to n.')
    if (op[0] !== 'upload' && op[0] !== 'longest') throw new Error('Operations are upload or longest.')
  })
  return { n: input.n, ops: input.ops }
}

export function build({ n, ops }) {
  const uploaded = new Set()
  let prefix = 0
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: 1, pythonLine: PY.setup, message: `Nothing uploaded; prefix is 0 of ${n}.`, uploaded: [], prefix, focus: -1 })
  ops.forEach((op, index) => {
    if (op[0] === 'upload') {
      uploaded.add(op[1])
      frames.push({ phase: 'upload', activeLine: 2, pythonLine: PY.upload, message: `Video ${op[1]} is uploaded.`, uploaded: [...uploaded], prefix, focus: op[1] })
    } else {
      frames.push({ phase: 'longest', activeLine: 3, pythonLine: PY.longest, message: 'Ask for the longest prefix.', uploaded: [...uploaded], prefix, focus: -1 })
      while (uploaded.has(prefix + 1)) {
        prefix += 1
        frames.push({ phase: 'advance', activeLine: 3, pythonLine: PY.advance, message: `Video ${prefix} is uploaded; prefix moves to ${prefix}.`, uploaded: [...uploaded], prefix, focus: prefix })
      }
      results.push(prefix)
      frames.push({ phase: 'answer', activeLine: 4, pythonLine: PY.answer, message: `Longest prefix is ${prefix}.`, uploaded: [...uploaded], prefix, focus: -1 })
    }
  })
  return { input: { n, ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing uploaded yet.' },
    { id: 'upload', label: 'Upload', description: 'Mark a video as uploaded.' },
    { id: 'longest', label: 'Query', description: 'Start advancing the prefix.' },
    { id: 'advance', label: 'Advance', description: 'The next video is present.' },
    { id: 'answer', label: 'Answer', description: 'Report the prefix.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with n and ops: [\'upload\', video] or [\'longest\']',
  url: 'https://leetcode.com/problems/longest-uploaded-prefix/',
  complexity: 'The prefix pointer only moves forward, so all advances together cost at most n steps over the whole run.',
  examples: [
    { label: 'Example', input: '{"n":4,"ops":[["upload",3],["longest"],["upload",1],["longest"],["upload",2],["longest"]]}' },
  ],
}

export default function LongestUploadedPrefix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Videos" length={run.input.n} indexOffset={1} active={step.focus > 0 ? step.focus - 1 : -1}
      valueAt={i => (step.uploaded.includes(i + 1) ? 'up' : '-')}
      roleAt={i => (i + 1 <= step.prefix ? 'prefix' : '')} />
    <output aria-label="Current prefix">{`Prefix ${step.prefix} of ${run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>The answer only grows when the next missing number arrives, so one pointer that moves forward is enough. Uploads never shrink the prefix, so the pointer never needs to go back.</p>
  </>} />
}
