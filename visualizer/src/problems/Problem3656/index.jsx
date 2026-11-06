import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DegreeBarsView from './DegreeBarsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '3656',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Degree list (e.g. [3, 3, 3, 3])',
  url: 'https://leetcode.com/problems/determine-if-a-simple-graph-exists/',
  complexity: 'O(n log n) time and O(n) space for n vertices, from sorting and the prefix checks. The visualization caps the list at 10 vertices with degrees up to 12; the official bounds are not verified here.',
  examples: [
    { label: 'Complete graph on four', input: '[3, 3, 3, 3]' },
    { label: 'Degree beyond reach', input: '[3, 1]' },
    { label: 'Two components', input: '[2, 2, 2, 0, 0]' },
  ],
}

export default function Problem3656Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <><IndexedSequence label="sorted degrees" length={(step.sorted ?? run.input).length} valueAt={i => (step.sorted ?? run.input)[i]} roleAt={i => step.k == null ? '' : i === step.k - 1 ? 'k' : i < step.k ? 'window' : ''} /><DegreeBarsView run={run} step={step} /></>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
