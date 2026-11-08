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
    { label: 'One push', input: '[["pushBack",5]]' },
    { label: 'Equal values in the middle', input: '[["pushFront",3],["pushBack",3],["popMiddle"]]' },
    { label: 'Pop until empty', input: '[["pushBack",1],["popFront"],["popBack"]]' },
    { label: 'Long run: 40 operations', input: '[["pushMiddle",13],["popMiddle"],["pushFront",12],["popBack"],["popMiddle"],["popMiddle"],["pushBack",67],["pushBack",55],["popMiddle"],["popBack"],["pushBack",71],["pushFront",49],["pushMiddle",33],["pushMiddle",26],["pushFront",23],["popFront"],["pushBack",46],["popBack"],["pushMiddle",75],["pushFront",56],["pushMiddle",97],["popBack"],["popFront"],["popFront"],["pushBack",84],["pushBack",96],["popFront"],["pushMiddle",81],["pushBack",47],["pushFront",16],["popMiddle"],["pushFront",38],["popBack"],["pushBack",50],["pushMiddle",51],["popMiddle"],["popMiddle"],["pushFront",25],["popMiddle"],["popMiddle"]]' },
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
