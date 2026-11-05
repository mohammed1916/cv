import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'segment', label: 'Whole', description: 'Price the segment as one piece.' },
    { id: 'choose', label: 'Choose', description: 'Keep the cheaper of whole or halves.' },
    { id: 'done', label: 'Result', description: 'Report the total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, encCost and flatCost',
  url: 'https://leetcode.com/problems/minimum-cost-to-partition-a-binary-string/',
  complexity: 'Each segment is priced once with memoisation, so the work is about the number of segments. The visual caps s at 16 characters.',
  examples: [
    { label: 'Example', input: '{"s":"1100","encCost":2,"flatCost":1}' },
    { label: 'Halves win', input: '{"s":"0110","encCost":3,"flatCost":2}' },
  ],
}

export default function MinimumCostToPartitionABinaryString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start}
      roleAt={i => (i === step.start ? 'l' : i === step.start + step.len - 1 ? 'r' : i > step.start && i < step.start + step.len - 1 ? (step.split ? 'split' : 'window') : '')} />
    <output aria-label="Segment cost">{`Segment ${step.start} to ${step.start + step.len - 1}: cost ${step.cost}${step.phase === 'choose' ? (step.split ? ' (split)' : ' (whole)') : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A segment with no sensitive element costs one flat charge. Otherwise it costs its length times its sensitive count times the encoding cost.</p>
    <p>An even segment can be split into equal halves, and each half is priced by the same rule, so the best cost of a segment is the smaller of keeping it whole and the best cost of its halves.</p>
  </>} />
}
