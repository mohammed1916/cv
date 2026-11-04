import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'
import ChainView from './ChainView'

const definition = {
  number: '2618',
  phases: [
    { id: 'check', label: 'Primitive check', description: 'Primitives are rejected first.' },
    { id: 'walk', label: 'Walk chain', description: 'Compare each class up the prototype chain.' },
    { id: 'found', label: 'Match', description: 'A prototype equals the target class.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with chain (nearest class first), target and primitive',
  url: 'https://leetcode.com/problems/check-if-object-instance-of-class/',
  complexity: 'O(k) time for a chain of k classes, O(1) extra space.',
  examples: [
    { label: 'Ancestor', input: '{"chain":["Dog","Animal","Object"],"target":"Animal"}' },
    { label: 'Primitive', input: '{"chain":["Object"],"target":"Object","primitive":true}' },
  ],
}

export default function CheckIfObjectInstanceOfClass() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <ChainView view={step.view} />}
    renderReasoning={() => <>
      <p>A value is an instance of a class when the class prototype appears somewhere on its prototype chain.</p>
      <p>Primitives have no prototype chain to walk, so they are answered before the loop starts.</p>
    </>} />
}
