import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MergeLedgerView from './MergeLedgerView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1199',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with blocks (list of times) and split (e.g. {"blocks":[1,2,3],"split":1})',
  url: 'https://leetcode.com/problems/minimum-time-to-build-blocks/',
  complexity: 'O(n log n) time and O(n) space for n blocks with a min-heap. The visualization caps the input at 8 blocks, times and split from 0 to 1000; the official bounds were not verified.',
  examples: [
    { label: 'Three blocks', input: '{"blocks":[1,2,3],"split":1}' },
    { label: 'Four equal blocks', input: '{"blocks":[1,1,1,1],"split":0}' },
    { label: 'Single block', input: '{\"blocks\":[5],\"split\":0}' },
    { label: 'Equal times, split on the tie', input: '{\"blocks\":[4,4],\"split\":4}' },
    { label: 'Zero build times', input: '{\"blocks\":[0,0,0],\"split\":0}' },
    { label: 'Long run: eight blocks at the limit', input: '{\"blocks\":[701,32,785,50,477,127,157,107],\"split\":1000}' },
  ],
}

export default function MinimumTimeToBuildBlocks() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MergeLedgerView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Merging the two fastest workers first keeps the slow blocks for the end, when fewer splits are added to them.
          {run ? ` The minimum building time is ${run.answer}.` : ''}
        </p>
      )}
    />
  )
}
