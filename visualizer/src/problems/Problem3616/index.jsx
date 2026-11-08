import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ArrivalLineView from './ArrivalLineView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: '3616',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Arrival ranks, smaller is better (e.g. [5, 3, 4, 1, 2])',
  url: 'https://leetcode.com/problems/number-of-student-replacements/',
  complexity: 'O(n) time and O(1) extra space for n arrivals. The visualization caps the line at 16 arrivals; the official bounds are not verified here.',
  examples: [
    { label: 'Two replacements', input: '[5, 3, 4, 1, 2]' },
    { label: 'Ties keep the selection', input: '[7, 7, 7]' },
    { label: 'Steady improvement', input: '[4, 3, 2, 1]' },
    { label: 'Single arrival', input: '[6]' },
    { label: 'Equal ranks in pairs', input: '[9,9,4,4]' },
    { label: 'Largest ranks', input: '[100,1,100,1]' },
    { label: 'Long run: 16 arrivals', input: '[63,13,52,48,71,44,79,10,75,55,77,22,79,61,81,23]' },
  ],
}

export default function Problem3616Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <><IndexedSequence label="ranks" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => i === step.index ? 'i' : i === step.selectedIndex ? 'selected' : ''} /><ArrivalLineView run={run} step={step} /></>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
