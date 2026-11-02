import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RoundingTableView from './RoundingTableView'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const definition = {
  number: '1058',
  phases: [
    { id: 'start', label: 'Floor sum', description: 'Round everything down first.' },
    { id: 'floor', label: 'Split', description: 'Each price has a floor and a fraction.' },
    { id: 'impossible', label: 'Impossible', description: 'The target cannot be reached.' },
    { id: 'need', label: 'Need', description: 'How many prices must round up.' },
    { id: 'cost', label: 'Cost', description: 'Extra error for rounding a price up.' },
    { id: 'sort', label: 'Sort', description: 'Cheapest round-ups first.' },
    { id: 'pick', label: 'Pick', description: 'Round the cheapest prices up.' },
    { id: 'done', label: 'Result', description: 'Report the error to three decimals.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with prices (decimal strings) and an integer target',
  url: 'https://leetcode.com/problems/minimize-rounding-error-to-meet-target/description/',
  complexity: 'O(n log n) time for n prices, from sorting the round-up costs; O(n) space. Calculations use integer micro-units. The visualization caps input at 8 prices with up to 3 integer digits and 6 decimals; the official bounds are not verified.',
  examples: [
    { label: 'Pick two round-ups', input: '{"prices":["0.700","2.800","4.900","0.000"],"target":8}' },
    { label: 'Impossible', input: '{"prices":["1.500","2.500","3.500"],"target":10}' },
    { label: 'Already integral', input: '{"prices":["1.000"],"target":1}' },
  ],
}

export default function MinimizeRoundingError() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoundingTableView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Rounding everything down is the cheapest start; each round-up then costs one extra amount, and the cheapest ones are chosen to close the gap to the target.</p>}
    />
  )
}
