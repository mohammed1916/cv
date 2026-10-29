import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Read the array length and start with no match.' },
    { id: 'scan', label: 'Scan', description: 'Visit each position of the circular array.' },
    { id: 'check', label: 'Check', description: 'Test for the target and measure both directions.' },
    { id: 'update', label: 'Update', description: 'Keep the shorter distance.' },
    { id: 'done', label: 'Result', description: 'Return the shortest distance or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Words object (JSON, e.g. {"words": ["a", "b"], "target": "a", "startIndex": 0})',
  url: 'https://leetcode.com/problems/shortest-distance-to-target-string-in-a-circular-array/',
  complexity: 'O(n) time and O(1) extra space for n words. The visualization caps the array at 100 words.',
  examples: [
    { label: 'Wraps the other way', input: '{"words": ["hello","i","am","leetcode","hello"], "target": "hello", "startIndex": 1}' },
    { label: 'One step left', input: '{"words": ["a","b","leetcode"], "target": "leetcode", "startIndex": 0}' },
    { label: 'Not present', input: '{"words": ["i","eat","leetcode"], "target": "ate", "startIndex": 0}' },
  ],
}

export default function ShortestDistanceCircularArray() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Circular words"
            length={run.input.words.length}
            active={step.index ?? -1}
            valueAt={(i) => run.input.words[i]}
            roleAt={(i) => (run.input.words[i] === run.input.target ? 'target' : i === run.input.startIndex ? 'start' : '')}
          />
          <output aria-label="Best distance so far">Best: {step.best}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
