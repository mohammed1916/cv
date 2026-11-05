import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stack.' },
    { id: 'letter', label: 'Push letter', description: 'A letter goes on top of the stack.' },
    { id: 'star', label: 'Star', description: 'A star removes the letter on top: the closest one to its left.' },
    { id: 'done', label: 'Complete', description: 'Report what remains on the stack.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with string s of letters and stars (JSON)',
  url: 'https://leetcode.com/problems/removing-stars-from-a-string/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Pairs', input: '{"s":"ab*c*d"}' },
    { label: 'Cascade', input: '{"s":"xy**z"}' },
  ],
}

export default function RemovingStars() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i}
      roleAt={i => (step.pairs.some(([a, b]) => a === i || b === i) ? 'removed' : i < step.i ? 'seen' : '')} />
    <IndexedSequence label="Stack of letter positions" length={step.stack.length} valueAt={i => step.stack[i].ch} indexOffset={0}
      active={step.stack.length - 1} roleAt={i => `at ${step.stack[i].p}`} />
    <output aria-label="Pairs">{step.pairs.length ? `Removed pairs (letter, star): ${step.pairs.map(([a, b]) => `${run.input.s[a]}@${a} with *@${b}`).join('; ')}` : 'No pairs removed yet.'}</output>
  </>} renderReasoning={() => <>
    <p>A star always deletes the closest letter that is still present to its left, which is exactly the top of a stack.</p>
    <p>Each star pairs with the most recent surviving letter, so the stack keeps the letters that no star has claimed.</p>
  </>} />
}
