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
    { label: 'Pick two round-ups', input: '{"prices":["0.400","3.250","1.600","0.000"],"target":6}' },
    { label: 'Impossible', input: '{"prices":["1.200","2.300"],"target":6}' },
    { label: 'Already integral', input: '{"prices":["2.000","0.500"],"target":2}' },
    { label: 'Single exact price', input: '{"prices":["1.000"],"target":1}' },
    { label: 'Equal prices', input: '{"prices":["0.500","0.500"],"target":1}' },
    { label: 'Largest input: eight prices near 999', input: '{"prices":["999.999","999.999","999.999","999.999","999.999","999.999","999.999","999.999"],"target":7992}' },
    { label: 'Long run: eight prices', input: '{"prices":["904.458","302.777","946.611","390.174","119.513","210.514","558.066","593.233"],"target":1500}' },
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
