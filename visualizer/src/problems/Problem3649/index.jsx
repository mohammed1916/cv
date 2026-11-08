import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No value pairs recorded yet.' },
    { id: 'check', label: 'Check pair', description: 'Test one index pair against the inequalities.' },
    { id: 'done', label: 'Result', description: 'Report the distinct value pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (2 to 12 integers, absolute values up to 50)',
  url: 'https://leetcode.com/problems/number-of-perfect-pairs/description/',
  complexity: 'O(n^2) index pairs in the visualization; each check is constant time.',
  examples: [
    { label: 'Invented example', input: '{"nums":[5,2,-7,4]}' },
    { label: 'Repeated values', input: '{"nums":[3,-3,6,3]}' },
    { label: 'Two zeros', input: '{"nums":[0,0]}' },
    { label: 'Equal magnitudes', input: '{"nums":[7,7,-7,-7]}' },
    { label: 'Extreme values', input: '{"nums":[50,-50]}' },
    { label: 'Long run: 12 values', input: '{"nums":[-33,-41,28,4,0,-1,-32,33,16,16,-15,-24]}' },
  ],
}

export default function NumberOfPerfectPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.pair ? step.pair[1] : -1}
      roleAt={i => step.pair && (i === step.pair[0] || i === step.pair[1]) ? (step.verdict ? 'perfect' : 'pair') : ''} />
    <output aria-label="Perfect pair count">{`unique qualifying value pairs: ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>For absolute values p and q, the two quantities |a - b| and |a + b| are |p - q| and p + q in some order, so the test reduces to whether the larger absolute value is at most twice the smaller.</p>
    <p>{step.verdict === null ? 'The visualization still checks each pair directly against the statement inequalities.' : step.verdict ? 'This pair satisfies both inequalities.' : 'This pair fails one of the inequalities.'}</p>
    <p>This teaching model is knowledge-derived and not verified against the official judge.</p>
  </>} />
}
