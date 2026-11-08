import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
    { id: 'check', label: 'Check', description: 'Compare the mountain before this index with the threshold.' },
    { id: 'stable', label: 'Stable', description: 'This index is added to the result.' },
    { id: 'done', label: 'Result', description: 'Report the stable indices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with height (array) and threshold',
  url: 'https://leetcode.com/problems/find-indices-of-stable-mountains/',
  complexity: 'O(n) time and O(n) space for the result.',
  examples: [
    { label: 'Example', input: '{"height":[5,9,2,8,7,1],"threshold":6}' },
    { label: 'None stable', input: '{"height":[3,1,4],"threshold":9}' },
    { label: 'Equal heights tie', input: '{"height":[3,3,3],"threshold":3}' },
    { label: 'Largest heights', input: '{"height":[100,1,100,1,100,1,100,1,100,1,100,1],"threshold":50}' },
    { label: 'Threshold equals a height', input: '{"height":[2,5,5,2,9],"threshold":5}' },
    { label: 'Long run: twelve generated heights', input: '{"height":[47,72,65,98,83,48,61,78,19,88,45,26],"threshold":40}' },
  ],
}

export default function FindIndicesOfStableMountains() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="height" length={run.input.height.length} valueAt={i => run.input.height[i]} active={step.index}
      roleAt={i => (step.stable.includes(i) ? 'stable' : '')} />
    <output aria-label="Stable indices">{`checking index ${step.index >= 0 ? step.index : 'none'}, stable: [${step.stable.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Index 0 can never be stable because there is no mountain before it.</p>
    <p>Every other index is checked once against the mountain immediately before it.</p>
  </>} />
}
