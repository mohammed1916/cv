import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Mark', description: 'Put the friend IDs in a set.' },
    { id: 'keep', label: 'Keep', description: 'This participant is a friend, so it joins the answer.' },
    { id: 'skip', label: 'Skip', description: 'This participant is not a friend.' },
    { id: 'done', label: 'Result', description: 'The answer keeps finishing order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with order and friends',
  url: 'https://leetcode.com/problems/restore-finishing-order/',
  complexity: 'O(n) time and O(n) space for one pass over the finishing order. The visualization caps order at 12 participants.',
  examples: [
    { label: 'Example', input: '{"order":[5,3,1,4,2],"friends":[2,4]}' },
    { label: 'Single friend', input: '{"order":[3,1,2],"friends":[2]}' },
  ],
}

export default function RestoreFinishingOrder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="order" length={run.input.order.length} valueAt={i => run.input.order[i]} active={step.index}
      roleAt={i => (run.input.friends.includes(run.input.order[i]) ? 'friend' : '')} />
    <output aria-label="Answer so far">{`answer = [${step.kept.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Friends are a short sorted list, so a set makes each membership check constant time.</p>
    <p>Walking the finishing order once and keeping only friends preserves the order they finished in.</p>
  </>} />
}
