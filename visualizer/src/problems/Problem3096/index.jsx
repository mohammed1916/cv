import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Points', description: 'Turn each level into plus one or minus one.' },
    { id: 'scan', label: 'Split', description: 'Give Alice one more level and compare totals.' },
    { id: 'found', label: 'Found', description: 'Alice now has more points than Bob.' },
    { id: 'done', label: 'Complete', description: 'No split works, so report -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with possible: 2 to 12 entries of 0 (fail) or 1 (pass)',
  url: 'https://leetcode.com/problems/minimum-levels-to-gain-more-points/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 levels.',
  examples: [
    { label: 'Example 1', input: '{"possible":[1,0,1,0]}' },
    { label: 'Example 2', input: '{"possible":[1,1,1,1,1]}' },
  ],
}

export default function MinimumLevelsToGainMorePoints() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="possible" length={run.input.possible.length} valueAt={index => run.input.possible[index]} active={step.index}
      roleAt={index => index < (step.k ?? 0) ? 'Alice' : 'Bob'} />
    <output aria-label="Points">{`Alice ${step.alice}, Bob ${step.bob}`}</output>
  </>} renderReasoning={() => <>
    <p>Each level is worth plus one for a pass and minus one for a fail, so a total is just a sum of plus and minus ones.</p>
    <p>Alice takes the first levels and Bob the rest, so the first split where Alice is ahead is the smallest answer.</p>
  </>} />
}
