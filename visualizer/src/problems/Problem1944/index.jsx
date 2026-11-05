import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1944',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of distinct heights (e.g. [10,6,8,5,11])',
  url: 'https://leetcode.com/problems/number-of-visible-people-in-a-queue/',
  complexity: 'O(n) time: each person is pushed and popped at most once. The stack is the set of people still able to be seen from the left.',
  examples: [
    { label: 'Mixed heights', input: '[10,6,8,5,11]' },
    { label: 'Increasing', input: '[1,2,3,4]' },
  ],
}

export default function Problem1944Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="Heights (left to right)" length={run.input.heights.length} valueAt={i => run.input.heights[i]}
        active={step.i} roleAt={i => (i === step.popped ? 'window' : i === step.i ? 'l' : '')} />
      <div aria-label="Stack, bottom to top" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>Stack (top at right):</strong>
        {step.stack.length === 0 && <em>empty</em>}
        {step.stack.map((idx, k) => <span key={k} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', background: 'var(--surface2)' }}>
          [{idx}] h={run.input.heights[idx]}
        </span>)}
      </div>
      <IndexedSequence label="Visible to the right (so far)" length={step.answer.length} valueAt={i => step.answer[i]} active={step.i} roleAt={i => (i === step.i ? 'l' : '')} />
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
