import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import NearestOppositeView from './NearestOppositeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No pair has been seen yet.' },
    { id: 'scan', label: 'Scan', description: 'Visit the next index.' },
    { id: 'skip', label: 'Skip', description: 'Zeros never form a pair.' },
    { id: 'other', label: 'Other', description: 'Look up the last index of the other value.' },
    { id: 'pair', label: 'Pair', description: 'The opposite value was seen earlier.' },
    { id: 'best', label: 'Best', description: 'This gap is the smallest so far.' },
    { id: 'remember', label: 'Remember', description: 'Store this index for its value.' },
    { id: 'done', label: 'Result', description: 'Report the smallest gap or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (entries are 0, 1 or 2)',
  url: 'https://leetcode.com/problems/minimum-absolute-difference-between-two-values/',
  complexity: 'O(n) time and O(1) space. The official length is up to 100; the visualization caps nums at 20 entries.',
  examples: [
    { label: 'Example', input: '{"nums":[1,0,0,2,0,1]}' },
    { label: 'No pair', input: '{"nums":[1,0,1,0]}' },
  ],
}

export default function MinimumAbsoluteDifferenceBetweenTwoValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <NearestOppositeView run={run} step={step} />} renderReasoning={() => <>
    <p>A 1 and a 2 form a pair with the nearest opposite value seen before them, so only the latest index of each value needs to be remembered.</p>
    <p>Each index is checked once against the other value, giving a linear scan.</p>
  </>} />
}
