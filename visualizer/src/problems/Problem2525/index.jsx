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
  inputLabel: 'Box object (JSON, e.g. {"length": 400, "width": 90, "height": 60, "mass": 120})',
  url: 'https://leetcode.com/problems/categorize-box-according-to-criteria/',
  complexity: 'O(1) time and O(1) space: a fixed number of comparisons.',
  examples: [
    { label: 'Heavy only', input: '{"length": 400, "width": 90, "height": 60, "mass": 120}' },
    { label: 'Neither', input: '{"length": 300, "width": 20, "height": 40, "mass": 12}' },
    { label: 'Smallest box', input: '{"length":1,"width":1,"height":1,"mass":1}' },
    { label: 'Equal dimensions and mass', input: '{"length":100,"width":100,"height":100,"mass":100}' },
    { label: 'Largest values', input: '{"length":100000,"width":100000,"height":100000,"mass":1000}' },
    { label: 'Long run: mid-range values', input: '{"length":12345,"width":6789,"height":4321,"mass":777}' },
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
