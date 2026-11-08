import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, TRANSFORMS } from './algorithm'

const definition = {
  number: '2635',
  phases: [
    { id: 'start', label: 'Start', description: 'Create an empty output list.' },
    { id: 'compute', label: 'Compute', description: 'Map the element with its index.' },
    { id: 'push', label: 'Push', description: 'Append the mapped value.' },
    { id: 'done', label: 'Result', description: 'The mapped list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arr (up to 8 whole numbers) and fn ("twicePlusIndex", "square" or "plusIndex")',
  url: 'https://leetcode.com/problems/apply-transform-over-each-element-in-array/',
  complexity: 'O(n) time and O(n) space for the output list.',
  examples: [
    { label: 'Three', input: '{"arr":[5,0,4]}' },
    { label: 'Squares', input: '{"arr":[-3,6],"fn":"square"}' },
    { label: 'Negative', input: '{"arr":[-1]}' },
    { label: 'Single zero', input: '{"arr":[0]}' },
    { label: 'Equal values', input: '{"arr":[4,4,4]}' },
    { label: 'Limit values squared', input: '{"arr":[99,-99,99,-99,99,-99,99,-99],"fn":"square"}' },
    { label: 'Long run: eight values', input: '{"arr":[-33,55,-75,65,-11,-98,-1,93]}' },
  ],
}

export default function ApplyTransformOverEachElement() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { arr } = run.input
      const focus = step.view.focus
      return <section aria-label="Transform state">
        <p className="algorithm-sequence__note">{`Map: ${TRANSFORMS[run.input.fn].label}. Each output lines up with the input at the same index.`}</p>
        <IndexedSequence label="Input" length={arr.length} active={focus} valueAt={index => arr[index]} roleAt={index => (index < step.view.out.length ? 'mapped' : '')} />
        <IndexedSequence label="Output" length={step.view.out.length} active={step.view.out.length - 1} valueAt={index => step.view.out[index]} roleAt={index => `from index ${index}`} />
      </section>
    }}
    renderReasoning={({ step }) => <>
      <p>A map builds a new list of the same length. The callback sees each element and its position, and its return value goes into the output at the same index.</p>
      <p>{step.view.next !== undefined ? `Current mapped value: ${step.view.next}.` : 'The input list is never changed.'}</p>
    </>} />
}
