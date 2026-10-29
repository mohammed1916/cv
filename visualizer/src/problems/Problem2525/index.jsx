import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const LABELS = ['length', 'width', 'height', 'mass']

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Read the box values and compute the volume.' },
    { id: 'check', label: 'Test', description: 'Evaluate the bulky and heavy criteria.' },
    { id: 'done', label: 'Result', description: 'Return the matching category.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Box object (JSON, e.g. {"length": 1000, "width": 35, "height": 700, "mass": 300})',
  url: 'https://leetcode.com/problems/categorize-box-according-to-criteria/',
  complexity: 'O(1) time and O(1) space: a fixed number of comparisons.',
  examples: [
    { label: 'Heavy only', input: '{"length": 1000, "width": 35, "height": 700, "mass": 300}' },
    { label: 'Neither', input: '{"length": 200, "width": 50, "height": 800, "mass": 50}' },
  ],
}

export default function CategorizeBox() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Box values"
            length={4}
            active={-1}
            valueAt={(i) => step.dims[i]}
            roleAt={(i) => LABELS[i]}
          />
          <output aria-label="Box category">Category: {run.result}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
