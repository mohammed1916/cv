import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import MemoView from './MemoView'

const definition = {
  number: '2623',
  phases: [
    { id: 'start', label: 'Start', description: 'Create an empty cache.' },
    { id: 'key', label: 'Key', description: 'Turn the arguments into a key.' },
    { id: 'hit', label: 'Hit', description: 'Reuse a stored answer.' },
    { id: 'miss', label: 'Miss', description: 'Run the function and store it.' },
    { id: 'return', label: 'Return', description: 'Answer this call.' },
    { id: 'done', label: 'Result', description: 'Totals.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with calls: a list of argument lists (up to 3 whole numbers each)',
  url: 'https://leetcode.com/problems/memoize/',
  complexity: 'O(total argument size) per call to build keys; each distinct argument list runs fn once.',
  examples: [
    { label: 'Repeats', input: '{"calls":[[1,2],[1,2],[3]]}' },
    { label: 'Empty args', input: '{"calls":[[],[],[5]]}' },
    { label: 'Single call with one argument', input: '{"calls":[[7]]}' },
    { label: 'Repeated identical calls', input: '{"calls":[[2,2],[2,2],[2,2]]}' },
    { label: 'Limit arguments and an empty call', input: '{"calls":[[99,-99,0],[-99],[]]}' },
    { label: 'Long run: ten calls', input: '{"calls":[[93],[-17,-57],[72,84,2],[-38],[51,-32],[-59,-90,83],[30],[-80,-7],[9,-65,-35],[98]]}' },
  ],
}

export default function Memoize() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <MemoView view={step.view} />}
    renderReasoning={() => <>
      <p>The cache maps an argument list to its answer. A repeated list is a hit and skips the real function.</p>
      <p>Serialising the arguments into a key lets equal lists match even though each call creates a new array.</p>
    </>} />
}
