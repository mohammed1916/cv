import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import CurryView from './CurryView'

const definition = {
  number: '2632',
  phases: [
    { id: 'collect', label: 'Collect', description: 'Add this call arguments to the list.' },
    { id: 'wait', label: 'Wait', description: 'Not enough arguments yet.' },
    { id: 'fire', label: 'Fire', description: 'Enough arguments, so fn runs.' },
    { id: 'done', label: 'Result', description: 'Final outcome.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arity (1 to 4) and calls (argument lists)',
  url: 'https://leetcode.com/problems/curry/',
  complexity: 'O(total arguments) time and space for the collected list.',
  examples: [
    { label: 'Split', input: '{"arity":3,"calls":[[1],[2,3]]}' },
    { label: 'Early', input: '{"arity":2,"calls":[[1],[2],[3]]}' },
    { label: 'Single argument list', input: '{"arity":1,"calls":[[5]]}' },
    { label: 'Equal arguments repeated', input: '{"arity":2,"calls":[[4],[4],[4,4]]}' },
    { label: 'Limit values and empty call', input: '{"arity":4,"calls":[[99,-99,0],[1],[],[-99]]}' },
    { label: 'Long run: six calls', input: '{"arity":3,"calls":[[98],[-12,-28],[77,-86,46],[-33],[56,-3],[-54,-61,-72]]}' },
  ],
}

export default function Curry() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <CurryView view={step.view} />}
    renderReasoning={() => <>
      <p>A curried function holds on to the arguments it has received. Each call adds to that list and checks it against the arity.</p>
      <p>Once the list is long enough, the original function runs with all of them at once.</p>
    </>} />
}
