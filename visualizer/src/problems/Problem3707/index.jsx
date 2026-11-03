import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'score', label: 'Score', description: 'Turn letters into alphabet positions.' },
    { id: 'scan', label: 'Cuts', description: 'Move the cut and compare the two sides.' },
    { id: 'done', label: 'Result', description: 'Whether an equal split exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON string of lowercase letters',
  url: 'https://leetcode.com/problems/equal-score-substrings/',
  complexity: 'O(n) time with one running total.',
  examples: [
    { label: 'Example', input: '"xaax"' },
    { label: 'No split', input: '"mnop"' },
  ],
}

export default function EqualScoreSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.cut ?? -1}
      roleAt={i => (step.cut === null || step.cut === undefined ? '' : (i <= step.cut ? 'left' : 'right'))} />
    <output aria-label="Scores">{`left ${step.left}, right ${step.right}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two equal halves must each be exactly half of the total. Only a cut where the running left score doubles to the total can work.</p>
    <p>A single running sum checks every cut in one pass.</p>
  </>} />
}
