import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read num and k, and handle the zero case.' },
    { id: 'try', label: 'Try count', description: 'Check whether this many numbers ending in k can add up to num.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with num (0 to 3000) and k (0 to 9)',
  url: 'https://leetcode.com/problems/sum-of-numbers-with-units-digit-k/',
  complexity: 'O(1) time, since at most ten counts are tried. The visualization caps num at 3000.',
  examples: [
    { label: 'Example 1', input: '{"num":58,"k":9}' },
    { label: 'Impossible', input: '{"num":37,"k":2}' },
  ],
}

export default function SumUnitsDigitK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Units digit of count times k" length={10} valueAt={index => ((index + 1) * run.input.k) % 10} active={(step.count ?? 0) - 1} />
    <output aria-label="Count tried">{`Count tried: ${step.count ?? 0}. Answer so far: ${step.answer ?? -1}.`}</output>
  </>} renderReasoning={() => <>
    <p>Each added number ends in k, so the total's units digit is count times k modulo 10. That pattern repeats after ten counts.</p>
    <p>The total must also be at least count times k, since every number is at least k.</p>
  </>} />
}
