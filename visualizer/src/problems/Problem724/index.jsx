import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Compute the total sum.' },
    { id: 'scan', label: 'Compare sides', description: 'Left sum against right sum at this index.' },
    { id: 'found', label: 'Pivot', description: 'The two sides match.' },
    { id: 'done', label: 'Complete', description: 'Return the pivot or −1.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON)',
  url: 'https://leetcode.com/problems/find-pivot-index/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Index three', input: '[1,7,3,6,5,6]' },
    { label: 'Edge pivot', input: '[1,2,3]' },
    { label: 'Zero sum', input: '[2,1,-1]' },
  ],
}

export default function PivotIndex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} active={step.index} valueAt={i => run.input[i]}
      roleAt={i => (step.phase === 'found' && i === step.index ? 'written' : '')} />
    <output aria-label="Sides">Left {step.left} · right {step.right}{step.phase === 'done' ? ` · result ${step.result}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Right sum by subtraction:</strong> right = total − left − nums[i], so no second pass is needed.</p>
  </>} />
}
