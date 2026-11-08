import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No device has been tested.' },
    { id: 'test', label: 'Test', description: 'A device still above zero is tested and drains the later ones.' },
    { id: 'skip', label: 'Skip', description: 'A device at zero is skipped.' },
    { id: 'done', label: 'Complete', description: 'Report the number tested.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with batteryPercentages',
  url: 'https://leetcode.com/problems/count-tested-devices-after-test-operations/',
  complexity: 'O(n) time. The visualization caps the list at 30 devices.',
  examples: [
    { label: 'Example 1', input: '{"batteryPercentages":[1,1,2,1,3]}' },
    { label: 'Example 2', input: '{"batteryPercentages":[0,1,2]}' },
    { label: 'Single device', input: '{"batteryPercentages":[0]}' },
    { label: 'Equal levels', input: '{"batteryPercentages":[50,50,50]}' },
    { label: 'Upper length, extremes', input: '{"batteryPercentages":[100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0,100,0]}' },
    { label: 'Long run: 30 devices', input: '{"batteryPercentages":[86,64,46,1,33,90,69,62,75,75,78,17,38,98,62,59,55,87,88,61,89,24,59,20,73,73,44,90,34,6]}' },
  ],
}

export default function TestedDevices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Battery levels after this step" length={step.levels.length}
      valueAt={i => `${step.levels[i]}%`} active={step.index}
      roleAt={i => (step.testedIdx.includes(i) ? 'tested' : '')} />
    <output aria-label="Tested count">{`Tested so far: ${step.tested}`}</output>
  </>} renderReasoning={() => <>
    <p>Testing a device lowers every later device by one, floored at zero. Since only tested devices lower later ones, the drain so far equals the number tested.</p>
    <p>So device i is tested exactly when its battery minus the tests so far is above zero.</p>
  </>} />
}
