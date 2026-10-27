import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Begin with two empty halves.' },
    { id: 'push', label: 'Push', description: 'Insert a value at its front, middle or back position.' },
    { id: 'pop', label: 'Pop', description: 'Remove a value from its front, middle or back position.' },
    { id: 'done', label: 'Complete', description: 'Report every popped value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as JSON, for example [["pushBack",2],["popMiddle"]]',
  url: 'https://leetcode.com/problems/design-front-middle-back-queue/',
  complexity: 'O(1) per operation: each one moves at most one item between the halves. The visualization caps input at 40 operations.',
  examples: [
    { label: 'Example', input: '[["pushFront",1],["pushBack",2],["pushMiddle",3],["pushMiddle",4],["popFront"],["popMiddle"],["popMiddle"],["popBack"],["popFront"]]' },
    { label: 'Empty pops', input: '[["popFront"],["popMiddle"]]' },
  ],
}

export default function FrontMiddleBackQueue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Front half" length={step.front.length} valueAt={index => step.front[index]} />
    <IndexedSequence label="Back half" length={step.back.length} valueAt={index => step.back[index]} />
    <output aria-label="Popped values">{`Popped so far: [${step.results.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>The queue is cut in two at its middle. The front half holds floor(n / 2) items, so the middle is always at the seam between the halves.</p>
    <p>Each operation touches one end of a half, then one item moves across the seam if the sizes drifted apart.</p>
  </>} />
}
