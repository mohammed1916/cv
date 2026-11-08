import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GapView from './GapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'collect', label: 'Collect', description: 'Record the index of each value.' },
    { id: 'start', label: 'Ready', description: 'Every value has its full list.' },
    { id: 'skip', label: 'Skip', description: 'Too few occurrences to qualify.' },
    { id: 'gap', label: 'First gap', description: 'Measure the gap of the first pair.' },
    { id: 'pair', label: 'Compare', description: 'This gap matches the first gap.' },
    { id: 'mismatch', label: 'Mismatch', description: 'A gap differs; the value fails.' },
    { id: 'add', label: 'Count', description: 'Every gap matched; count the value.' },
    { id: 'done', label: 'Result', description: 'Return the count.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of values (e.g. [3,7,3,7,3,7,3])',
  url: 'https://leetcode.com/problems/count-values-with-equally-spaced-occurrences-ii/',
  complexity: 'O(n) expected time and O(n) space for n values, using a table of index lists. The visualization caps the array at 20 values; the official limit is 100000.',
  examples: [
    { label: 'Constant gaps', input: '[3,7,3,7,3,7,3]' },
    { label: 'Mixed gaps', input: '[5,9,5,9,5,9,5,9,9]' },
    { label: "Equal values", input: "[4,4,4]" },
    { label: "Largest values", input: "[1000000000,1,1000000000]" },
    { label: "Three distinct values", input: "[1,2,3]" },
    { label: "Long run: 20 values", input: "[91013163,296386582,876698931,134060878,252637275,53886125,137112055,535963769,507063909,481916243,578919410,18819748,448031642,935378989,679163973,924126094,490669291,97334452,431310920,809408699]" },
  ],
}

export default function CountValuesEquallySpacedII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <GapView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
