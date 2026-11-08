import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FlipView from './FlipView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3576', phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 or -1) and k',
  url: 'https://leetcode.com/problems/transform-array-to-all-equal-elements/',
  complexity: 'O(n) time and O(n) space for the working copy; the sign alone would need O(1). The official length is up to 100000; the visualization caps nums at 20 entries.',
  examples: [
    { label: 'Second target wins', input: '{"nums":[-1,1,1,1,-1,1],"k":3}' },
    { label: 'One move short', input: '{"nums":[-1,1,1,1,-1,1],"k":2}' },
    { label: 'Parity blocks both', input: '{"nums":[1,-1,1,1],"k":4}' },
    { label: 'Single entry', input: '{"nums":[-1],"k":1}' },
    { label: 'Single positive entry', input: '{"nums":[1],"k":1}' },
    { label: 'Already all equal', input: '{"nums":[1,1,1,1],"k":2}' },
    { label: 'Window equals whole array', input: '{"nums":[-1,1,-1,1,-1],"k":5}' },
    { label: 'Long run: 20 entries', input: '{"nums":[-1,1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,-1,1,-1,1,-1,-1,1],"k":7}' },
  ],
}

export default function TransformArrayToAllEqualElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <FlipView run={run} step={step} />} renderReasoning={() => <>
    <p>The final array is all 1 or all -1, so only two targets need checking. Scanning from the left, the first wrong entry can only be fixed by the pair that starts on it, because the pair to its left would break an entry already settled.</p>
    <p>That leaves no choices, so the sweep gives the fewest moves for that target. A move changes two signs at once, so the number of wrong entries keeps its parity; if that number is odd, the last entry ends up wrong however the moves are made.</p>
  </>} />
}
