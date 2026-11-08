import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AbsSelectionView from './AbsSelectionView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '3667',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array (e.g. [-4, -1, 0, 2, 10])',
  url: 'https://leetcode.com/problems/sort-array-by-absolute-value/',
  complexity: 'O(n²) time and O(n) space for this selection-style trace on n values. The visualization caps the array at 10 values with magnitudes up to 20; the official bounds are not verified here.',
  examples: [
    { label: 'Mixed signs', input: '[-4, -1, 0, 2, 10]' },
    { label: 'Equal magnitudes', input: '[5, -5, 5]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Equal magnitudes', input: '[5,-5,5,-5]' },
    { label: 'Extreme values', input: '[-20,20,-20,20,-20,20,-20,20,-20,20]' },
    { label: 'Long run: 10 values', input: '[12,-14,0,10,10,2,8,11,-17,-6]' },
  ],
}

export default function Problem3667Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <><IndexedSequence label="values" length={step.remaining.length} valueAt={i => run.input[step.remaining[i]]} roleAt={i => i === step.m ? 'm' : i === step.i ? 'i' : ''} /><AbsSelectionView run={run} step={step} /></>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
