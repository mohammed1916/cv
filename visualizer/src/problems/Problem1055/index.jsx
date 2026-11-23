import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShortestWayView from './ShortestWayView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1055',
  phases: [
    { id: 'start', label: 'Start', description: 'No pieces are counted yet.' },
    { id: 'piece', label: 'Piece', description: 'Start a new subsequence of source.' },
    { id: 'take', label: 'Take', description: 'The source letter extends the piece.' },
    { id: 'scan', label: 'Scan', description: 'This source letter does not extend the piece.' },
    { id: 'stuck', label: 'Stuck', description: 'A whole pass made no progress.' },
    { id: 'done', label: 'Result', description: 'Report the number of pieces or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with source and target strings',
  url: 'https://leetcode.com/problems/shortest-way-to-form-string/description/',
  complexity: 'O(m * n) time for source length m and target length n, since each piece scans source once; O(n) extra space. The visualization caps each string at 12 characters; the official bounds are not verified.',
  question: "Find the fewest subsequences of a source string that together spell a target, or -1 if impossible.",
  approaches: [
    { name: "Greedy subsequence matching", intuition: "Each piece matches as far as it can through the source; when the source is used up, a new piece starts.", time: "O(m * n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Four pieces', input: '{"source":"abcd","target":"dcba"}' },
    { label: 'Impossible letter', input: '{"source":"xyz","target":"xyq"}' },
    { label: 'Three pieces', input: '{"source":"xyz","target":"xzyxz"}' },
    { label: 'Single letter match', input: '{"source":"a","target":"a"}' },
    { label: 'Whole string in one piece', input: '{"source":"abcdef","target":"abcdef"}' },
    { label: 'Repeated letters, longest input', input: '{"source":"abcabcabcabc","target":"cbacbacbacba"}' },
    { label: 'Long run: 12 letters', input: '{"source":"caabcbbbabba","target":"bccbbbacbabc"}' },
  ],
}

export default function ShortestWayToFormString() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShortestWayView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each piece walks the source once, taking every letter it can match in order; the number of walks is the answer.</p>}
    />
  )
}
