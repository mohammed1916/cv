import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { reverseListTutorial } from './tutorial'
import ReverseTutorialVisual from './ReverseTutorial'
import './ReverseTutorial.css'

const definition = {
  number: '206',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of node values (e.g. [12, 5, 19]); 0 to 12 values',
  url: 'https://leetcode.com/problems/reverse-linked-list/',
  complexity: 'O(n) time and O(1) extra space: three pointers, one pass.',
  examples: [
    { label: 'Long list with repeated values', input: '[12,5,19,5,3,14,8,21,6]' },
    { label: 'Two nodes', input: '[7,13]' },
    { label: 'Singleton', input: '[17]' },
    { label: 'Empty', input: '[]' },
  ],
}

export default function Problem206Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    tutorial={reverseListTutorial}
    renderVisual={({ run, step }) => <ReverseTutorialVisual run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
