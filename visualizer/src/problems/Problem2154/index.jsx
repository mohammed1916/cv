import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2154',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums and original',
  url: 'https://leetcode.com/problems/keep-multiplying-found-values-by-two/',
  complexity: 'O(n + log v) time for n numbers and the number of doublings; O(n) space for the set.',
  examples: [
    { label: 'Chain of three', input: '{"nums":[3,1,6,4,12],"original":3}' },
    { label: 'Stops at once', input: '{"nums":[5,2],"original":4}' },
    { label: 'Single value found', input: '{"nums":[5],"original":5}' },
    { label: 'Duplicates in the list', input: '{"nums":[2,2,4],"original":2}' },
    { label: 'Original not in the list', input: '{"nums":[3,6],"original":5}' },
    { label: 'Largest chain', input: '{"nums":[1000,500,250,125],"original":125}' },
    { label: 'Long run: 30 values', input: '{"nums":[842,454,187,658,233,378,140,659,433,5,188,994,272,834,327,89,464,998,995,532,422,916,234,297,645,626,473,346,523,714],"original":380}' },
  ],
}

export default function Problem2154Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Values in nums (current ${step.current})`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1} roleAt={i => (step.trail.includes(run.input.nums[i]) ? 'found' : '')} />
          <p>Trail: {step.trail.join(' → ') || 'none yet'} → {step.current}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
