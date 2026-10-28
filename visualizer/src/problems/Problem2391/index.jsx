import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pickup', label: 'Pickups', description: 'Count the garbage in each house.' },
    { id: 'truck', label: 'Trucks', description: 'Add the drive to the last house that needs each truck.' },
    { id: 'done', label: 'Complete', description: 'Report the total minutes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with garbage (2 to 8 houses of M, P or G) and travel (one time per road)',
  url: 'https://leetcode.com/problems/minimum-amount-of-time-to-collect-garbage/',
  complexity: 'O(n * 3) time with prefix sums of travel times. The visualization caps input at 8 houses.',
  examples: [
    { label: 'Example 1', input: '{"garbage":["G","P","GP","GG"],"travel":[2,4,3]}' },
    { label: 'Example 2', input: '{"garbage":["MMM","PGM","GP"],"travel":[3,10]}' },
  ],
}

export default function MinimumGarbageTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="houses" length={run.input.garbage.length} valueAt={index => run.input.garbage[index]} active={step.index}
      roleAt={index => step.truck && index === step.index ? `${step.truck} stop` : ''} />
    <output aria-label="Running total">{`Minutes so far: ${step.total}${step.truck ? `, ${step.truck} truck` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Each truck must visit its last house that holds its garbage, and it passes every earlier house on the way.</p>
    <p>The drive to any house is a prefix sum of travel times, so each truck costs one lookup.</p>
  </>} />
}
