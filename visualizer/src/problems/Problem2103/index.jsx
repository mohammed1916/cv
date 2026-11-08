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
    { label: 'None full', input: 'R5G5B5' }, { label: "One ring", input: "R0" }, { label: "Same rod repeated", input: "R3G3B3R3G3" }, { label: "Largest input: 100 rings", input: "R0G1B2R3G4B5R6G7B8R9G0B1R2G3B4R5G6B7R8G9B0R1G2B3R4G5B6R7G8B9R0G1B2R3G4B5R6G7B8R9G0B1R2G3B4R5G6B7R8G9B0R1G2B3R4G5B6R7G8B9R0G1B2R3G4B5R6G7B8R9G0B1R2G3B4R5G6B7R8G9B0R1G2B3R4G5B6R7G8B9R0G1B2R3G4B5R6G7B8R9" }, { label: "Long run: 100 rings", input: "R7R5B3G5G2B8B2B2G8B0B3G6G5G5R7B9G7R8B8R0B1G7R0G1G5B4B5B9B8B1R6R2R0R6B6B0R8G7G9G6R7G1G4R5B6R8R7G4R9G7B1B9G6G1G8R3B4G8R2B9R4B6B7B9B4G9R0B4G6R1R0G7R4R5G3R9B1B6R1B2B4R3B0B4B9R1R6G8B2B9R3R5R7G9R1R2B9R4B9B1" },
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
