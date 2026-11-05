import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2103',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Colour and rod pairs (e.g. R3G2B1)',
  url: 'https://leetcode.com/problems/rings-and-rods/',
  complexity: 'O(n) time for n rings, with ten fixed rod sets; O(1) extra space.',
  examples: [
    { label: 'One full rod', input: 'R1G1B1R2G3' },
    { label: 'Two full rods', input: 'B0R0G0R9R9G9B9' },
    { label: 'None full', input: 'R5G5B5' },
  ],
}

export default function Problem2103Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence label="Rods 0 to 9 (colours present)" length={10} valueAt={i => step.rods[i] || '·'} active={step.current} roleAt={i => (step.full.includes(i) ? 'all three' : '')} />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
